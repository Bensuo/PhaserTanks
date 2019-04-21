var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var gameInstance = require('./js/game-instance');
var uuidv1 = require('uuid/v1');
var sqlite3 = require('sqlite3').verbose();
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 5000;
const MAX_PLAYERS = 2;

var db = new sqlite3.Database('highscores.db');

function writeHighScores(scores) {
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS highscores(player_name TEXT NOT NULL, score INTEGER NOT NULL)");

        var stmt = db.prepare("INSERT INTO highscores VALUES (?,?)")
        for (let i = 0; i < scores.length; i++) {
            const score = scores[i];
            stmt.run(score.name, score.score);
        }
        stmt.finalize();

        db.each("SELECT rowid AS id, player_name, score FROM highscores", function (err, row) {
            console.log(row.id + ": Name: " + row.player_name + " Score: " + row.score);
        });
    });

}

function sendHighScores(socket) {
    var scores = [];
    db.serialize(function () {
        db.each("SELECT rowid AS id, player_name, score FROM highscores ORDER BY score DESC", function (err, row) {
            scores.push({ name: row.player_name, score: row.score });
        }, function () {
            //Send message in callback because db access is async
            socket.emit('highScores', scores);
        });
    });
}

var rooms = [];
var games = {};
var clients = {};

const ClientStatus = {
    WAITING_TO_START: 'waiting_to_join',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    READY: 'ready',
    PLAYING: 'playing'
};

function createRoom() {
    var id = uuidv1();
    var room = {
        roomID: id,
        clients: [],
        game: null
    };
    rooms.push(room);
    return room;
};

function getFirstAvailableRoom() {
    for (let i = 0; i < rooms.length; i++) {
        const room = rooms[i];
        if (room.clients.length < MAX_PLAYERS) {
            return room;
        }
    }
    //No available room, make a new one
    return createRoom();
};

function onRequestNewGame(socket) {
    clients[socket.id].uniqueID = uuidv1();
    //TODO: Finding open rooms or creating a new one
    //Tell the client we are finding a room
    socket.emit('id', clients[socket.id].uniqueID);
    socket.emit('waitingForRoom');
    var room = getFirstAvailableRoom();
    clients[socket.id].room = room;
    clients[socket.id].status = ClientStatus.WAITING_TO_START;
    socket.join(room.roomID);
    room.clients.push(clients[socket.id]);

    socket.emit('waitingToStart', { id: room.roomID, playerCount: room.clients.length });
    socket.on('waitingToStart', function () {
        setTimeout(function () {
            var room = clients[socket.id].room;
            if (room.clients.length == MAX_PLAYERS) {
                socket.emit('readyToStart');
                socket.on('confirmReady', function () {
                    clients[socket.id].status = ClientStatus.READY;
                    startGame(socket, room);
                });
            }
            else {
                socket.emit('waitingToStart', { id: room.roomID, playerCount: room.clients.length });
            }
        }, 250);

    });

};

function startGame(socket, room) {
    socket.on('playerUpdate', function (updateData) {
        var client = clients[socket.id];
        if (client.room && client.room.game) {
            client.room.game.UpdatePlayer(client.uniqueID, updateData);
        }

    });

    if (room.clients.every(client => client.status == ClientStatus.READY)) {
        room.game = new gameInstance(io, room.roomID);
        room.game.GameEvents.on('GameFinished', function (scores) {
            
            room.game = null;
            for (let i = 0; i < room.clients.length; i++) {
                var client = room.clients[i];
                client.room = null;
                client.status = ClientStatus.CONNECTED;
            }
            for (let i = 0; i < rooms.length; i++) {
                const r = rooms[i];
                if (r === room) {
                    rooms.splice(i, 1);
                }
            }
            writeHighScores(scores);
        });
        room.clients.forEach(client => room.game.AddPlayer(client.uniqueID, client.name));
        io.to(room.roomID).emit('gameStarted');
        io.to(room.roomID).emit('currentPlayers', room.game.GetAllPlayersState());
        io.to(room.roomID).emit('currentBullets', room.game.GetAllBulletState());
        room.game.Start();
    }
};

(function () {

    //games['game1'] = new gameInstance(io, 'game1');
    app.use(express.static(__dirname + '/public'));

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', function (socket) {
        clients[socket.id] = {
            socketID: socket.id,
            uniqueID: '',
            status: ClientStatus.CONNECTED,
            room: null,
            name: ''
        };
        console.log('a user connected');
        socket.on('playerName', function (name) {
            var client = clients[socket.id];
            if (client) client.name = name;
        })
        socket.on('requestHighScores', function () {
            sendHighScores(socket);
        })
        socket.on('requestNewGame', function () {
            onRequestNewGame(socket);
        });
        socket.on('requestRejoin', function (info) {
            var room = rooms[info.room];
            if (room) {
                if (!room.game.PlayerReconnected(info.id)) {
                    socket.emit('FailedToReconnect', 'ID is not valid for this room');
                }
                else {
                    clients[socket.id].uniqueID = info.id;
                    clients[socket.id].room = room;
                    socket.emit('explosionHistory', room.game.GetExplosionHistory());
                    socket.emit('ReconnectSuccessful');
                }
            }
            else {
                socket.emit('FailedToReconnect', 'Invalid Room');
            }

        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
            var client = clients[socket.id];
            if (client) {
                var room = clients[socket.id].room;
                switch (client.status) {
                    case ClientStatus.WAITING_TO_START:
                        if (room) {
                            room.clients.splice(room.clients.indexOf(client), 1);
                        }
                        break;
                    case ClientStatus.READY:
                    case ClientStatus.PLAYING:
                        if (room) {
                            room.game.PlayerDisconnected(clients[socket.id].uniqueID);
                        }
                        break;
                    default:
                        break;
                }
            }


        });
    });

    server.listen(port, function () {
        console.log(`Listening on ${server.address().port}`);
    });
}());