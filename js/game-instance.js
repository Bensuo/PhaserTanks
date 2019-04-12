var p = require('planck-js');

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

const verts = [
    p.Vec2(0, 1360), p.Vec2(43, 1352),
    p.Vec2(83, 1141), p.Vec2(118, 1139), p.Vec2(150, 962), p.Vec2(181, 961),
    p.Vec2(206, 831), p.Vec2(265, 831), p.Vec2(303, 1267), p.Vec2(342, 1265),
    p.Vec2(365, 1335), p.Vec2(531, 1367), p.Vec2(544, 1352), p.Vec2(497, 1340),
    p.Vec2(586, 1101), p.Vec2(627, 1374), p.Vec2(564, 1358), p.Vec2(573, 1381),
    p.Vec2(679, 1410), p.Vec2(771, 1437), p.Vec2(884, 1478), p.Vec2(1020, 1520),
    p.Vec2(1023, 1498), p.Vec2(992, 1229), p.Vec2(941, 1163), p.Vec2(965, 1144),
    p.Vec2(1023, 927), p.Vec2(1132, 1105), p.Vec2(1169, 1112), p.Vec2(1141, 1194),
    p.Vec2(1142, 1211), p.Vec2(1203, 1211), p.Vec2(1221, 1267), p.Vec2(1244, 1266),
    p.Vec2(1264, 1213), p.Vec2(1346, 1213), p.Vec2(1361, 1264), p.Vec2(1383, 1263),
    p.Vec2(1390, 1214), p.Vec2(1467, 1213), p.Vec2(1469, 1195), p.Vec2(1438, 1114),
    p.Vec2(1475, 1106), p.Vec2(1585, 928), p.Vec2(1644, 1144), p.Vec2(1666, 1163),
    p.Vec2(1616, 1229), p.Vec2(1588, 1499), p.Vec2(1596, 1534), p.Vec2(1685, 1511),
    p.Vec2(1784, 1471), p.Vec2(1858, 1437), p.Vec2(1932, 1407), p.Vec2(1935, 1381),
    p.Vec2(1903, 1386), p.Vec2(1915, 1321), p.Vec2(1902, 1321), p.Vec2(1920, 1244),
    p.Vec2(1911, 1243), p.Vec2(1927, 1158), p.Vec2(1974, 1249), p.Vec2(1964, 1249),
    p.Vec2(1984, 1311), p.Vec2(1969, 1313), p.Vec2(1997, 1370), p.Vec2(1967, 1376),
    p.Vec2(1971, 1392), p.Vec2(2114, 1345), p.Vec2(2159, 1233), p.Vec2(2212, 1232),
    p.Vec2(2330, 752), p.Vec2(2444, 752), p.Vec2(2518, 1063), p.Vec2(2556, 1064),
    p.Vec2(2672, 1330), p.Vec2(2909, 1072), p.Vec2(2966, 1073), p.Vec2(2986, 981),
    p.Vec2(3139, 961), p.Vec2(3270, 1032), p.Vec2(3252, 1131), p.Vec2(3326, 1163),
    p.Vec2(3478, 1504), p.Vec2(3519, 1314), p.Vec2(3551, 1314), p.Vec2(3587, 1191),
    p.Vec2(3662, 1192), p.Vec2(3710, 1410), p.Vec2(3759, 1391), p.Vec2(3763, 1364),
    p.Vec2(3731, 1366), p.Vec2(3744, 1301), p.Vec2(3732, 1301), p.Vec2(3752, 1227),
    p.Vec2(3743, 1226), p.Vec2(3761, 1138), p.Vec2(3806, 1233), p.Vec2(3797, 1231),
    p.Vec2(3814, 1295), p.Vec2(3802, 1296), p.Vec2(3825, 1352), p.Vec2(3794, 1359),
    p.Vec2(3801, 1378), p.Vec2(3839, 1363), p.Vec2(3839, 2108), p.Vec2(0, 2109)];

function GameInstance(io, room) {
    this.player_count = 0;
    this.frameCount = 0;
    this.id = {};
    this.stop = false;
    this.playersToRemove = [];
    this.timestepInSeconds = 1 / 60;
    this.timestepInMilliseconds = this.timestepInSeconds * 1000;

    this.bullets = [];
    this.players = {};
    this.loop = require('node-gameloop');
    this.io = io;
    this.room = room;
    this.world = p.World({
        gravity: p.Vec2(0, 5)
    });

    this.groundFD = {
        density: 20.0,
        friction: 0.06
    };

    verts.map(x => x.setMul(1 / 32.0, x));
    this.groundVertices = p.Chain(verts);

    this.ground = this.world.createBody();
    this.ground.createFixture(this.groundVertices, this.groundFD);
    this.ground.createFixture({
        shape: this.groundVertices,
        density: this.groundFD.density,
        friction: this.groundFD.friction
    })

    this.box = this.world.createDynamicBody(p.Vec2(25, 0));
    this.box.createFixture(p.Box(1, 1), 2.5);

    this.id = this.loop.setGameLoop(this.Update.bind(this), this.timestepInMilliseconds);

    console.log('GameInstance created');

};

GameInstance.prototype.Update = function (delta) {
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


    this.io.to(this.room).emit('serverUpdate', this.GetAllPlayersState());
};

GameInstance.prototype.CreateBullet = function (player) {

    var worldRot = player.gunRotation + player.body.getAngle();

    var direction = p.Vec2(Math.cos(worldRot), Math.sin(worldRot));
    direction.normalize();
    direction.mul(2);

    console.log(`Direction: ${direction.x}, ${direction.y}`);

    var position = p.Vec2(player.x, player.y);

    var body = this.world.createDynamicBody(
        {
            type: 'dynamic',
            angularDamping: 5.0,
            linearDamping: 0.5,
            position,
            angle: 0.0,
            allowSleep: true
        }
    );

    body.createFixture(p.Box(-0.5, -0.5,p.Vec2(0.5, 0.5)), { friction: 0.05, density: 0.4 });
    
    body.applyLinearImpulse(body.getWorldVector(direction), body.getWorldCenter(), true);

    this.bullets.push(
        {
            body
        }
    );

    return true;
};

GameInstance.prototype.AddPlayer = function (socket_id) {
    if (this.player_count >= MAX_PLAYERS) {
        return false;
    }
    else {

        this.players[socket_id] = {
            x: 7,
            y: 18,
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
        body.createFixture(p.Box(1.4, 0.2,p.Vec2(0, 0.7)), { friction: 0.05, density: 0.4 });
        body.createFixture(p.Box(1, 0.8,p.Vec2(0, 0.3)), { friction: 0.05, density: 0.1 });
        body.createFixture(p.Circle(p.Vec2(0,-0.3), 0.5), { friction: 0.05, density: 0.1 });
        
        this.players[socket_id].body = body;
        this.player_count++;

        return true;
    }
};

GameInstance.prototype.RemovePlayer = function (socket_id) {
    this.playersToRemove.push(socket_id);


};

GameInstance.prototype.UpdatePlayer = function (id, updateData) {
    //console.log('PlayerUpdate received');
    //console.log(updateData);

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

GameInstance.prototype.GetAllPlayersState = function () {

    var players_state = {
        bullets: []
    }

    for (var key in this.players) {
        var player = this.players[key];
        players_state[key] = {
            x: player.body.getPosition().x,
            y: player.body.getPosition().y,
            rotation: player.body.getAngle(),
            gunRotation: player.gunRotation,
            playerId: key
        }
    }

    var arrayLength = this.bullets.length;

    for (var i = 0; i < arrayLength; i++) {
        players_state.bullets.push({
            x: this.bullets[i].body.getPosition().x,
            y: this.bullets[i].body.getPosition().y,
            rotation: this.bullets[i].body.getAngle()
        });
    }

    return players_state
}

GameInstance.prototype.GetAllBulletState = function () {
    return this.bullets;
}

module.exports = GameInstance;