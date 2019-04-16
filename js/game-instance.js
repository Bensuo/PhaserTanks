var p = require('planck-js');
var march = require('./marching-squares-opt')
var PNG = require('pngjs').PNG
var fs = require('fs')
var clipsy = require('clipsy')

const MAX_PLAYERS = 4;

const gameActions = {
    UP: 'up',
    LEFT: 'left',
    RIGHT: 'right',
    DOWN: 'down',
    TILT_LEFT: 'tilt_left',
    TILT_RIGHT: 'tilt_right',
    FIRE: 'fire'
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
    var path = './public/assets/backgrounds/snowLevel.png';
    var data = fs.readFileSync(path);

    var image_data = PNG.sync.read(data);
    var width = image_data.width;
    var height = image_data.height;
    var points = march.getBlobOutlinePoints(image_data.data, width, height);
    this.levelGeometry = [[]];
    for (var i = 0; i < points.length; i += 32) {
        this.levelGeometry[0].push({ X: points[i], Y: points[i + 1] });
    }
    this.player_count = 0;
    this.frameCount = 0;
    this.id = {};
    this.stop = false;
    this.playersToRemove = [];
    this.explosions = [];
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
    this.GenerateLevelGeometry();
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

    self.id = self.loop.setGameLoop(self.Update.bind(self), self.timestepInMilliseconds);

    console.log('GameInstance created');

    self.world.on('pre-solve', function (contact) {
        var fA = contact.getFixtureA(), bA = fA.getBody();
        var fB = contact.getFixtureB(), bB = fB.getBody();

        // do not change world immediately
        setTimeout(function () {
            if (bA.isTankMissile) {
                self.world.destroyBody(bA);
                var i = self.bullets.indexOf(bA);
                if (!removeFromArray(self.bullets, i)) return;

                self.explosions.push({
                    worldX: bA.getPosition().x,
                    worldY: bA.getPosition().y
                });

                self.RemoveBullet(i);

            }
            if (bB.isTankMissile) {
                self.world.destroyBody(bB);
                var i = self.bullets.indexOf(bB);
                if (!removeFromArray(self.bullets, i)) return;

                self.explosions.push({
                    worldX: bB.getPosition().x,
                    worldY: bB.getPosition().y
                });

                self.RemoveBullet(i);

            }
        });
    }, 1);
};
GameInstance.prototype.GenerateLevelGeometry = function () {
    var fixtures = this.ground.getFixtureList();
    while (fixtures) {
        fixtures = fixtures.getNext();
        this.ground.destroyFixture(this.ground.getFixtureList());
    }

    for (let i = 0; i < this.levelGeometry.length; i++) {
        const geom = this.levelGeometry[i].map(g => p.Vec2(g.X / 32.0, g.Y / 32.0));
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
        var h = position.worldX * 32;
        var k = position.worldY * 32;
        var r = 250;
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

GameInstance.prototype.Update = function (delta) {
    //this.GenerateLevelGeometry();
    //Remove any players which are disconnected

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

        while (player.actions.length > 0) {

            var action = player.actions.pop();

            switch (action) {
                case gameActions.UP:
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.0, -0.2)), player.body.getWorldCenter(), true);
                    break;
                case gameActions.DOWN:
                    //player.body.applyLinearImpulse(p.Vec2(0.0, 0.1), player.body.getWorldCenter(), true);
                    break;
                case gameActions.LEFT:
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.1, 0.0)), player.body.getWorldPoint(p.Vec2(0, 0.7)), true);
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.1, 0.0)), player.body.getWorldCenter(), true);
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.0, 0.003)), player.body.getWorldPoint(p.Vec2(-1.3, 0)), true);
                    //player.body.applyAngularImpulse(-0.05, true);
                    break;
                case gameActions.RIGHT:
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.1, 0.0)), player.body.getWorldPoint(p.Vec2(0, 0.7)), true);
                    player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(0.1, 0.0)), player.body.getWorldCenter(), true);
                    //player.body.applyLinearImpulse(player.body.getWorldVector(p.Vec2(-0.0, 0.003)), player.body.getWorldPoint(p.Vec2(1.3, 0)), true);
                    //player.body.applyAngularImpulse(-0.05, true);
                    break;
                case gameActions.TILT_LEFT:
                    player.body.applyAngularImpulse(-0.07, true);
                    break;
                case gameActions.TILT_RIGHT:
                    player.body.applyAngularImpulse(0.07, true);
                    break;
                case gameActions.FIRE:
                    //Shoot stuff
                    this.CreateBullet(player);
                    break;
            }
        }
    };

    this.world.step(this.timestepInSeconds);

    if(this.explosions.size > 0)
    {
        this.DamageLevelGeometry(this.explosions);
    }

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
    this.explosions = [];
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
    var gunLength = 1.66;

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

    this.bullets.push(body);

    return true;
};

GameInstance.prototype.RemoveBullet = function (index) {
    this.bullets.splice(index, 1);
}

GameInstance.prototype.AddPlayer = function (socket_id) {
    if (this.player_count >= MAX_PLAYERS) {
        return false;
    }
    else {

        this.players[socket_id] = {
            gunRotation: 0.0,
            playerId: socket_id,
            actions: []
        };

        var body = this.world.createDynamicBody(
            {
                type: 'dynamic',
                angularDamping: 5.0,
                linearDamping: 0.5,
                position: p.Vec2(7, 18),
                angle: 0.0,
                allowSleep: true
            }
        );
        body.createFixture(p.Box(1.4, 0.2, p.Vec2(0, 0.7)), { friction: 0.05, density: 0.4 });
        body.createFixture(p.Box(1, 0.8, p.Vec2(0, 0.3)), { friction: 0.05, density: 0.1 });
        body.createFixture(p.Circle(p.Vec2(0, -0.3), 0.5), { friction: 0.05, density: 0.1 });

        this.players[socket_id].body = body;
        this.player_count++;

        return true;
    }
};

GameInstance.prototype.RemovePlayer = function (socket_id) {
    this.playersToRemove.push(socket_id);
};

GameInstance.prototype.UpdatePlayer = function (id, updateData) {
    this.players[id].actions.push(...Array.from(updateData.actions));
    this.players[id].gunRotation = updateData.gunRotation;
};

GameInstance.prototype.GetSinglePlayerState = function (id) {
    var player = this.players[id];
    var player_state = {
        x: player.body.getPosition().x,
        y: player.body.getPosition().y,
        rotation: player.body.getAngle(),
        gunRotation: player.gunRotation,
        playerId: id
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
        players: this.GetAllPlayersState()
    }

    return game_state;
}

module.exports = GameInstance;