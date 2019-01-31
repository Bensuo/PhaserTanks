var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var p = require('planck-js');
var loop = require('node-gameloop');
var players = {};

// this function is immediately invoked
(function () { 

    var world = p.World({
        gravity : p.Vec2(0, 10)
    });

    app.use(express.static(__dirname + '/public'));
 
    app.get('/', function (req, res) {
      res.sendFile(__dirname + '/index.html');
    });
    
    io.on('connection', function (socket) {
    
        console.log('a user connected');
    
        socket.on('disconnect', function () {
            console.log('user disconnected');
            // remove this player from our players object
            delete players[socket.id];
            // emit a message to all players to remove this player
            io.emit('disconnect', socket.id);
        });
    
        // when a player moves, update the player data
        socket.on('playerMovement', function (movementData) {
            players[socket.id].x = movementData.x;
            players[socket.id].y = movementData.y;
            players[socket.id].rotation = movementData.rotation;
            // emit a message to all players about the player that moved
            socket.broadcast.emit('playerMoved', players[socket.id]);
        });
    
        // create a new player and add it to our players object
        players[socket.id] = {
            x: 233, 
            y: 790,
            playerId: socket.id,
        };
    
        // send the players object to the new player
        socket.emit('currentPlayers', players);
        // update all other players of the new player
        socket.broadcast.emit('newPlayer', players[socket.id]);
    });
    
    server.listen(5000, function () {
      console.log(`Listening on ${server.address().port}`);
    });

    var groundFD = {
        density : 0.0,
        friction : 0.6
    };

    var groundVertices =  p.Polygon([
        p.Vec2(0,    1360), p.Vec2(43,   1352),
        p.Vec2(83,   1141), p.Vec2(118,  1139), p.Vec2(150,  962),  p.Vec2(181,  961),
        p.Vec2(206,  831),  p.Vec2(265,  831),  p.Vec2(303,  1267), p.Vec2(342,  1265),
        p.Vec2(365,  1335), p.Vec2(531,  1367), p.Vec2(544,  1352), p.Vec2(497,  1340),
        p.Vec2(586,  1101), p.Vec2(627,  1374), p.Vec2(564,  1358), p.Vec2(573,  1381),
        p.Vec2(679,  1410), p.Vec2(771,  1437), p.Vec2(884,  1478), p.Vec2(1020, 1520),
        p.Vec2(1023, 1498), p.Vec2(992,  1229), p.Vec2(941,  1163), p.Vec2(965,  1144),
        p.Vec2(1023, 927),  p.Vec2(1132, 1105), p.Vec2(1169, 1112), p.Vec2(1141, 1194),
        p.Vec2(1142, 1211), p.Vec2(1203, 1211), p.Vec2(1221, 1267), p.Vec2(1244, 1266),
        p.Vec2(1264, 1213), p.Vec2(1346, 1213), p.Vec2(1361, 1264), p.Vec2(1383, 1263),
        p.Vec2(1390, 1214), p.Vec2(1467, 1213), p.Vec2(1469, 1195), p.Vec2(1438, 1114),
        p.Vec2(1475, 1106), p.Vec2(1585, 928),  p.Vec2(1644, 1144), p.Vec2(1666, 1163),
        p.Vec2(1616, 1229), p.Vec2(1588, 1499), p.Vec2(1596, 1534), p.Vec2(1685, 1511),
        p.Vec2(1784, 1471), p.Vec2(1858, 1437), p.Vec2(1932, 1407), p.Vec2(1935, 1381),
        p.Vec2(1903, 1386), p.Vec2(1915, 1321), p.Vec2(1902, 1321), p.Vec2(1920, 1244),
        p.Vec2(1911, 1243), p.Vec2(1927, 1158), p.Vec2(1974, 1249), p.Vec2(1964, 1249),
        p.Vec2(1984, 1311), p.Vec2(1969, 1313), p.Vec2(1997, 1370), p.Vec2(1967, 1376),
        p.Vec2(1971, 1392), p.Vec2(2114, 1345), p.Vec2(2159, 1233), p.Vec2(2212, 1232),
        p.Vec2(2330, 752),  p.Vec2(2444, 752),  p.Vec2(2518, 1063), p.Vec2(2556, 1064),
        p.Vec2(2672, 1330), p.Vec2(2909, 1072), p.Vec2(2966, 1073), p.Vec2(2986, 981),
        p.Vec2(3139, 961),  p.Vec2(3270, 1032), p.Vec2(3252, 1131), p.Vec2(3326, 1163),
        p.Vec2(3478, 1504), p.Vec2(3519, 1314), p.Vec2(3551, 1314), p.Vec2(3587, 1191),
        p.Vec2(3662, 1192), p.Vec2(3710, 1410), p.Vec2(3759, 1391), p.Vec2(3763, 1364),
        p.Vec2(3731, 1366), p.Vec2(3744, 1301), p.Vec2(3732, 1301), p.Vec2(3752, 1227),
        p.Vec2(3743, 1226), p.Vec2(3761, 1138), p.Vec2(3806, 1233), p.Vec2(3797, 1231),
        p.Vec2(3814, 1295), p.Vec2(3802, 1296), p.Vec2(3825, 1352), p.Vec2(3794, 1359),
        p.Vec2(3801, 1378), p.Vec2(3839, 1363), p.Vec2(3839, 2108), p.Vec2(0,    2109)]);

    var ground = world.createBody({});
    ground.createFixture(groundVertices, groundFD);

    // Boxes
    var box = world.createDynamicBody(p.Vec2(800, 0));
    box.createFixture(p.Box(25, 25), 0.5);

    var frameCount = 0;
    var id = {};
    var stop = false;

    var timestepInSeconds = 1 / 60;
    var timestepInMilliseconds = timestepInSeconds * 1000;

    id = loop.setGameLoop(function(delta) {

        world.step(timestepInSeconds);

        console.log('Box state: (x=%s, y=%s, r=%s)', box.getPosition().x, box.getPosition().y, box.getAngle());
        console.log('Ground state: (x=%s, y=%s, r=%s)', ground.getPosition().x, ground.getPosition().y, ground.getAngle());

        if(stop)
        {
            loop.clearGameLoop(id);
        }

        var box_send = {
            x: box.getPosition().x,
            y: box.getPosition().y,
            r: box.getAngle(),
            size: 50
        };

        // send the players object to the new player
        io.emit('box', box_send);

    }, timestepInMilliseconds);

}());