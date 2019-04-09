var p = require('planck-js');
const MAX_PLAYERS = 4;
const gameActions = {
    UP: 'up',
    LEFT: 'left',
    RIGHT: 'right',
    DOWN: 'down',
    FIRE: 'fire'
}
function GameInstance(io, room) {
    this.player_count = 0;
    this.frameCount = 0;
    this.id = {};
    this.stop = false;

    this.timestepInSeconds = 1 / 60;
    this.timestepInMilliseconds = this.timestepInSeconds * 1000;

    this.players = {};
    this.loop = require('node-gameloop');
    this.io = io;
    this.room = room;
    this.world = p.World({
        gravity: p.Vec2(0, 10)
    });

    this.groundFD = {
        density: 0.0,
        friction: 0.6
    };

    this.groundVertices = p.Polygon([
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
        p.Vec2(3801, 1378), p.Vec2(3839, 1363), p.Vec2(3839, 2108), p.Vec2(0, 2109)]);

    this.ground = this.world.createBody({});
    this.ground.createFixture(this.groundVertices, this.groundFD);

    this.box = this.world.createDynamicBody(p.Vec2(800, 0));
    this.box.createFixture(p.Box(25, 25), 0.5);

    this.id = this.loop.setGameLoop(this.Update.bind(this), this.timestepInMilliseconds);

    console.log('GameInstance created');

};

GameInstance.prototype.Update = function (delta) {
    //Process player actions
    console.log(this.players);
    for (var key in this.players) {
        var player = this.players[key];
        //console.log(player.actions);
        while (player.actions.length > 0) {
            var action = player.actions.pop();
            
            switch (action) {
                case gameActions.UP:
                    console.log('UP HIT');
                    player.y -= 5;
                    break;
                case gameActions.DOWN:
                    player.y += 5;
                    break;
                case gameActions.LEFT:
                    player.x -= 5;
                    break;
                case gameActions.RIGHT:
                    player.x += 5;
                    break;
                case gameActions.FIRE:
                    //Shoot stuff
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
    var server_state = {
        players: this.players
    }
    this.io.to(this.room).emit('serverUpdate', server_state);
};
GameInstance.prototype.AddPlayer = function (socket_id) {
    if (this.player_count >= MAX_PLAYERS) {
        return false;
    }
    else {
        this.players[socket_id] = {
            x: 233,
            y: 790,
            rotation: 0.0,
            playerId: socket_id,
            actions: []
        };
        this.player_count++;

        return true;
    }
};

GameInstance.prototype.RemovePlayer = function (socket_id) {
    delete this.players[socket_id];


};

GameInstance.prototype.UpdatePlayer = function (id, updateData) {
    console.log('PlayerUpdate received');
    //console.log(updateData);

    this.players[id].actions.push(...Array.from(updateData.actions));

    this.players[id].rotation = updateData.gunRotation;

};

module.exports = GameInstance;