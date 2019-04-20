var p = require('planck-js');
var march = require('./marching-squares-opt')
var PNG = require('pngjs').PNG
var fs = require('fs')
var clipsy = require('clipsy')
var EventEmitter = require('events')
const MAX_PLAYERS = 4;

const DAMAGE = 50;

const BLAST_RADIUS = 100;

const WORLD_SCALE = 32;

//Game time limit in seconds
const TIME_LIMIT = 120;

const gameActions = {
    UP: 'up',
    LEFT: 'left',
    RIGHT: 'right',
    DOWN: 'down',
    TILT_LEFT: 'tilt_left',
    TILT_RIGHT: 'tilt_right',
    FIRE: 'fire'
}

const GameState = {
    LOADING: 'loading',
    PLAYING: 'playing',
    FINISHED: 'finished'
}

function removeFromArray(array, i) {
    if (i == -1) {
        return false;
    } else {
        array.splice(i, 1);
        return true;
    }
}

function GameInstance(io, room) {
    this.gameState = GameState.LOADING;
    var path = './public/assets/backgrounds/snowLevel.png';
    var data = fs.readFileSync(path);

    var image_data = PNG.sync.read(data);
    var width = image_data.width;
    this.minSpawnX = (width / WORLD_SCALE) * 0.1;
    this.maxSpawnX = (width / WORLD_SCALE) * 0.9;
    var height = image_data.height;
    var points = march.getBlobOutlinePoints(image_data.data, width, height);
    this.levelGeometry = [[]];
    for (var i = 0; i < points.length; i += WORLD_SCALE) {
        this.levelGeometry[0].push({ X: points[i], Y: points[i + 1] });
    }
    this.player_count = 0;
    this.frameCount = 0;
    this.gameTimer = 0;
    this.id = {};
    this.stop = false;
    this.playersToRemove = [];
    this.explosions = [];
    this.lifetimeExplosions = [];
    this.timestepInSeconds = 1 / 60;
    this.timestepInMilliseconds = this.timestepInSeconds * 1000;

    var self = this;

    self.player_count = 0;
    self.frameCount = 0;
    self.id = {};
    self.stop = false;
    self.playersToRemove = [];
    self.timestepInSeconds = 1 / 60;
    self.timestepInMilliseconds = self.timestepInSeconds * 1000;

    self.bullets = [];
    self.players = {};
    self.loop = require('node-gameloop');
    self.io = io;
    self.room = room;
    self.world = p.World({
        gravity: p.Vec2(0, 5)
    });

    self.groundFD = {
        density: 20.0,
        friction: 0.06
    };
    this.ground = this.world.createBody();
    this.ground.isGround = true;
    this.GenerateLevelGeometry();
    //Generate level bounds
    this.levelBounds = {};
    this.levelBounds.left = this.world.createBody(p.Vec2(-10, (height/WORLD_SCALE/2)));
    this.levelBounds.left.createFixture(p.Box(10, (height/WORLD_SCALE/2)));
    this.levelBounds.right = this.world.createBody(p.Vec2(width/WORLD_SCALE + 10, (height/WORLD_SCALE/2)));
    this.levelBounds.right.createFixture(p.Box(10, (height/WORLD_SCALE/2)));
    this.levelBounds.top = this.world.createBody(p.Vec2(width/WORLD_SCALE/2, -10));
    this.levelBounds.top.createFixture(p.Box(width/WORLD_SCALE/2, 10));
    this.levelBounds.bottom = this.world.createBody(p.Vec2(width/WORLD_SCALE/2, height/WORLD_SCALE + 10));
    this.levelBounds.bottom.createFixture(p.Box(width/WORLD_SCALE/2, 10));
    /* this.levelGeometry.map(x => x.setMul(1 / 32.0, x));
    var groundVertices = p.Chain(this.levelGeometry);

    
    //this.ground.createFixture(groundVertices, this.groundFD);
    this.ground.createFixture({
        shape: groundVertices,
        density: this.groundFD.density,
        friction: this.groundFD.friction
    }) */

    self.box = self.world.createDynamicBody(p.Vec2(25, 0));
    self.box.createFixture(p.Box(1, 1), 2.5);



    console.log('GameInstance created');

    self.world.on('pre-solve', function (contact) {
        var fA = contact.getFixtureA(), bA = fA.getBody();
        var fB = contact.getFixtureB(), bB = fB.getBody();

        // do not change world immediately
        setTimeout(function () {
            if (bA.isTankMissile) {
                var i = self.bullets.indexOf(bA);
                if (!removeFromArray(self.bullets, i)) return;

                self.explosions.push({
                    worldX: bA.getPosition().x,
                    worldY: bA.getPosition().y,
                    player: bA.player
                });

                self.RemoveBullet(bA);
            }
            if (bB.isTankMissile) {
                var i = self.bullets.indexOf(bB);
                if (!removeFromArray(self.bullets, i)) return;

                self.explosions.push({
                    worldX: bB.getPosition().x,
                    worldY: bB.getPosition().y,
                    player: bB.player
                });

                self.RemoveBullet(bB);
            }
        });
    }, 1);
};

GameInstance.prototype.GameEvents = new EventEmitter();

GameInstance.prototype.GenerateLevelGeometry = function () {
    var fixtures = this.ground.getFixtureList();
    while (fixtures) {
        fixtures = fixtures.getNext();
        this.ground.destroyFixture(this.ground.getFixtureList());
    }

    for (let i = 0; i < this.levelGeometry.length; i++) {
        const geom = this.levelGeometry[i].map(g => p.Vec2(g.X / WORLD_SCALE, g.Y / WORLD_SCALE));
        var groundVertices = p.Chain(geom);
        this.ground.createFixture({
            shape: groundVertices,
            density: this.groundFD.density,
            friction: this.groundFD.friction
        });
    }


}
GameInstance.prototype.DamageLevelGeometry = function (positions) {
    var geometry = [];
    for (let i = 0; i < positions.length; i++) {
        const position = positions[i];
        var circle = [];
        var step = 2 * Math.PI / 40;  // see note 1
        var h = position.worldX * WORLD_SCALE;
        var k = position.worldY * WORLD_SCALE;
        var r = BLAST_RADIUS;
        for (var theta = 0; theta < 2 * Math.PI; theta += step) {
            circle.push({ X: h + r * Math.cos(theta), Y: k - r * Math.sin(theta) });
        }
        geometry.push(circle);
    }

    var cpr = new clipsy.Clipper();
    cpr.AddPolygons(this.levelGeometry, clipsy.PolyType.ptSubject);
    cpr.AddPolygons(geometry, clipsy.PolyType.ptClip);
    var newGeometry = new clipsy.Polygons();
    var succeeded = cpr.Execute(clipsy.ClipType.ctDifference, newGeometry, clipsy.PolyFillType.pftEvenOdd, clipsy.PolyFillType.pftEvenOdd);
    newGeometry = clipsy.Clean(newGeometry, 0.1);
    this.levelGeometry = cpr.SimplifyPolygons(newGeometry, clipsy.PolyFillType.pftNonZero);
    this.GenerateLevelGeometry();
}

GameInstance.prototype.Start = function () {
    this.gameState = GameState.PLAYING;
    this.id = this.loop.setGameLoop(this.Update.bind(this), this.timestepInMilliseconds);
}

GameInstance.prototype.Stop = function () {
    this.loop.clearGameLoop(this.id);
    this.io.to(this.room).emit('gameFinished', {});
    var scores = [];
    for (var key in this.players) {
        var player = this.players[key];
        scores.push({ name: player.playerId, score: player.kills });
    }
    this.GameEvents.emit('GameFinished', scores);
}

GameInstance.prototype.ProcessExplosions = function (explosions) {
    for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        var explosionPos = p.Vec2(explosion.worldX, explosion.worldY);

        for (var key in this.players) {
            var player = this.players[key];
            var playerPos = player.body.getPosition();

            var distance = p.Vec2.distance(explosionPos, playerPos);

            console.log(`Bullet distance ${distance}`);

            if (distance < BLAST_RADIUS / WORLD_SCALE) {
                var ratio = 1 - (distance / (BLAST_RADIUS / WORLD_SCALE));
                var damage = ratio * DAMAGE;

                player.health -= damage;

                if (player.health <= 0) {
                    //Update kill counts
                    if (explosion.player === key) {
                        player.kills--;
                    }
                    else {
                        this.players[explosion.player].kills++;
                    }

                    console.log(`Player ${key} dead`);
                    this.KillPlayer(key);
                    continue;
                }

                console.log(`Player ${key} health: ${player.health}`);
            }
        }
    }

    this.DamageLevelGeometry(explosions);
};


GameInstance.prototype.Update = function (delta) {

    if (this.explosions.length > 0) {
        this.ProcessExplosions(this.explosions);
    }

    for (var i = 0; i < this.playersToRemove.length; i++) {
        var id = this.playersToRemove[i];
        this.world.destroyBody(this.players[id].body);
        delete this.players[id];
        this.player_count--;
    }
    this.playersToRemove = [];

    //Process player actions
    for (var key in this.players) {

        var player = this.players[key];
        player.isBoosting = false;
        player.hasFired = false;
        while (player.actions.length > 0) {

            var action = player.actions.pop();

            switch (action) {
                case gameActions.UP:
                    player.isBoosting = true;
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.0, -0.2)), player.body.getWorldCenter(), true);
                    break;
                case gameActions.DOWN:
                    //player.body.applyLinearImpulse(p.Vec2(0.0, 0.1), player.body.getWorldCenter(), true);
                    break;
                case gameActions.LEFT:
                player.isBoosting = true;
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.1, 0.0)), player.body.getWorldPoint(p.Vec2(0, 0.7)), true);
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.1, 0.0)), player.body.getWorldCenter(), true);
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.0, 0.003)), player.body.getWorldPoint(p.Vec2(-1.3, 0)), true);
                    //player.body.applyAngularImpulse(-0.05, true);
                    break;
                case gameActions.RIGHT:
                player.isBoosting = true;
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.1, 0.0)), player.body.getWorldPoint(p.Vec2(0, 0.7)), true);
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.1, 0.0)), player.body.getWorldCenter(), true);
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.0, 0.003)), player.body.getWorldPoint(p.Vec2(1.3, 0)), true);
                    //player.body.applyAngularImpulse(-0.05, true);
                    break;
                case gameActions.TILT_LEFT:
                player.isBoosting = true;
                    player.body.applyAngularImpulse(-0.2, true);
                    break;
                case gameActions.TILT_RIGHT:
                player.isBoosting = true;
                    player.body.applyAngularImpulse(0.2, true);
                    break;
                case gameActions.FIRE:
                player.hasFired = true;
                    //Shoot stuff
                    this.CreateBullet(player);
                    break;
            }
        }
    };

    this.world.step(this.timestepInSeconds);

    //console.log('Box state: (x=%s, y=%s, r=%s)', this.box.getPosition().x, this.box.getPosition().y, this.box.getAngle());
    //console.log('Ground state: (x=%s, y=%s, r=%s)', this.ground.getPosition().x, this.ground.getPosition().y, this.ground.getAngle());

    if (this.stop) {
        this.loop.clearGameLoop(this.id);
    }

    var box_send = {
        x: this.box.getPosition().x,
        y: this.box.getPosition().y,
        r: this.box.getAngle(),
        size: 50
    };

    // send the players object to the new player
    this.io.to(this.room).emit('box', box_send);
    this.io.to(this.room).emit('explosions', this.explosions);

    this.io.to(this.room).emit('serverUpdate', this.GetGameState());
    this.lifetimeExplosions.push(...this.explosions);
    this.explosions = [];
    //TODO: Decide when to stop the game
    //Update timer
    this.gameTimer += delta;
    if (this.gameTimer >= TIME_LIMIT) {
        this.Stop();
    }
    //this.Stop();
};

function rotateVector(v, radians) {

    var ca = Math.cos(radians);
    var sa = Math.sin(radians);

    return {
        x: ca * v.x - sa * v.y,
        y: sa * v.x + ca * v.y
    };
}

GameInstance.prototype.CreateBullet = function (player) {

    var worldRot = player.gunRotation + player.body.getAngle();

    var gunOffset = rotateVector(p.Vec2(0, -0.6), player.body.getAngle());
    var gunLength = 1.5;

    var direction = p.Vec2(Math.cos(worldRot), Math.sin(worldRot));

    var position = p.Vec2(player.body.getPosition().x, player.body.getPosition().y);

    position.add(gunOffset);

    position.add(direction.clone().mul(gunLength));

    var body = this.world.createDynamicBody(
        {
            type: 'dynamic',
            position: position,
            bullet: true,
            angle: worldRot
        }
    );

    body.createFixture(p.Box(0.25, 0.25), 100.0);

    body.setLinearVelocity(direction.mul(30));

    body.isTankMissile = true;

    body.player = player.playerId;

    this.bullets.push(body);

    return true;
};

GameInstance.prototype.GetSpawnPosition = function () {
    var randomX = Math.random() * (this.maxSpawnX - this.minSpawnX) + this.minSpawnX;
    var raycastResult =
    {
        point: null,
        normal: null
    }
    this.world.rayCast(p.Vec2(randomX, 0), p.Vec2(randomX, 2000), function (fixture, point, normal, fraction) {
        var body = fixture.getBody();
        var userData = body.getUserData();
        if (body.isGround) {
            raycastResult.point = point;
            raycastResult.normal = normal;
        }

        return fraction;
    });
    raycastResult.point.y -= 5;
    return raycastResult.point;
}
GameInstance.prototype.KillPlayer = function (playerId) {
    var player = this.players[playerId];
    player.body.setPosition(this.GetSpawnPosition());
    player.body.setAngle(0.0);
    player.body.setLinearVelocity(p.Vec2(0, 0));
    player.body.setAngularVelocity(0.0);
    player.health = 100;
    player.deaths++;
}

GameInstance.prototype.RemoveBullet = function (bullet) {
    this.world.destroyBody(bullet);
}

GameInstance.prototype.AddPlayer = function (id) {
    if (this.player_count >= MAX_PLAYERS) {
        return false;
    }
    else {

        this.players[id] = {
            health: 100.0,
            kills: 0,
            deaths: 0,
            gunRotation: 0.0,
            playerId: id,
            actions: [],
            connected: true,
            isBoosting: false,
            hasFired: false,
        };

        var body = this.world.createDynamicBody(
            {
                type: 'dynamic',
                angularDamping: 5.0,
                linearDamping: 0.5,
                position: this.GetSpawnPosition(),
                angle: 0.0,
                allowSleep: true,
                isTank: true
            }
        );
        body.createFixture(p.Box(1.4, 0.2, p.Vec2(0, 0.7)), { friction: 0.05, density: 0.4 });
        body.createFixture(p.Box(1, 0.8, p.Vec2(0, 0.3)), { friction: 0.05, density: 0.1 });
        body.createFixture(p.Circle(p.Vec2(0, -0.3), 0.5), { friction: 0.05, density: 0.1 });

        this.players[id].body = body;
        this.player_count++;

        return true;
    }
};

GameInstance.prototype.PlayerDisconnected = function (id) {
    this.players[id].connected = false;
};

GameInstance.prototype.PlayerReconnected = function (id) {
    var player = this.playuers[id];
    if (player) {
        player.connected = true;
        return true;
    }
    else {
        return false;
    }
};

GameInstance.prototype.UpdatePlayer = function (id, updateData) {
    this.players[id].actions.push(...Array.from(updateData.actions));
    this.players[id].gunRotation = updateData.gunRotation;
};

GameInstance.prototype.GetExplosionHistory = function () {
    return this.lifetimeExplosions;
};

GameInstance.prototype.GetSinglePlayerState = function (id) {
    var player = this.players[id];
    var player_state = {
        health: player.health,
        x: player.body.getPosition().x,
        y: player.body.getPosition().y,
        rotation: player.body.getAngle(),
        gunRotation: player.gunRotation,
        playerId: id,
        health: player.health,
        kills: player.kills,
        isBoosting: player.isBoosting,
        hasFired: player.hasFired,
    };
    return player_state;
}

GameInstance.prototype.GetSingleBulletState = function (i) {
    return {
        x: this.bullets[i].getPosition().x,
        y: this.bullets[i].getPosition().y,
        rotation: this.bullets[i].getAngle()
    };
}

GameInstance.prototype.GetAllBulletState = function () {

    var bulletData = [];
    var arrayLength = this.bullets.length;

    for (var i = 0; i < arrayLength; i++) {
        bulletData.push(this.GetSingleBulletState(i));
    }

    return bulletData;
}

GameInstance.prototype.GetAllPlayersState = function () {

    var players_state = {}

    for (var key in this.players) {
        players_state[key] = this.GetSinglePlayerState(key);
    }

    return players_state;
}

GameInstance.prototype.GetGameState = function () {

    var game_state = {
        bullets: this.GetAllBulletState(),
        players: this.GetAllPlayersState(),
        currentTime: this.gameTimer,
        timeLimit: TIME_LIMIT
    }

    return game_state;
}

module.exports = GameInstance;