var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var gameInstance = require('./js/game-instance');
var uuidv1 = require('uuid/v1');

const MAX_PLAYERS = 2;
var rooms = [];
var games = {};
var clients = {};
// this function is immediately invoked
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
                    startGame(socket,room);
                });
            }
            else {
                socket.emit('waitingToStart', { id: room.roomID, playerCount: room.clients.length });
            }
        }, 250);

    });

};

function startGame(socket,room) {
    socket.on('playerUpdate', function (updateData) {
        var client = clients[socket.id];
        client.room.game.UpdatePlayer(client.uniqueID, updateData);
    });
    if (room.clients.every(client => client.status == ClientStatus.READY)) {
        room.game = new gameInstance(io, room.roomID);
        room.game.GameEvents.on('GameFinished',function()
        {
            room.game = null;
            for (let i = 0; i < room.clients.length; i++) {
                const client = room.clients[i];
                client.room = null;
            }
            for (let i = 0; i < rooms.length; i++) {
                const r = rooms[i];
                if(r === room)
                {
                    rooms.splice(i, 1);
                }
            }
        });
        room.clients.forEach(client => room.game.AddPlayer(client.uniqueID));
        io.to(room.roomID).emit('gameStarted');
        io.to(room.roomID).emit('currentPlayers', room.game.GetAllPlayersState());
        io.to(room.roomID).emit('currentBullets', room.game.GetAllBulletState());
        room.game.Start();
        
    }


    // update all other players of the new player
    //socket.to(room).emit('newPlayer', games[room].GetSinglePlayerState(socket.id));

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
            room: null
        };
        console.log('a user connected');
        socket.on('requestNewGame', function () {
            onRequestNewGame(socket);
        });
        socket.on('requestRejoin', function (info) {
            var room = rooms[info.room];
            if(room)
            {
                if(!room.game.PlayerReconnected(info.id))
                {
                    socket.emit('FailedToReconnect', 'ID is not valid for this room');
                }
                else{
                    clients[socket.id].uniqueID = info.id;
                    clients[socket.id].room = room;
                    socket.emit('explosionHistory', room.game.GetExplosionHistory());
                    socket.emit('ReconnectSuccessful');
                }
            }
            else{
                socket.emit('FailedToReconnect', 'Invalid Room');
            }
            
        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
    
            var room = clients[socket.id].room;
            if (room) {
                room.game.PlayerDisconnected(clients[socket.id].uniqueID);
            }
        });
    });

    


    server.listen(5000, function () {
        console.log(`Listening on ${server.address().port}`);
    });
}());