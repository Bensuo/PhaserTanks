var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var gameInstance = require('./js/game-instance');


var games = {};
var clients = {};
// this function is immediately invoked
(function () {

    games['game1'] = new gameInstance(io, 'game1');
    app.use(express.static(__dirname + '/public'));

    app.get('/', function (req, res) {
        res.sendFile(__dirname + '/index.html');
    });

    io.on('connection', function (socket) {

        console.log('a user connected');
        clients[socket.id] = {
            room: ''
        }
        //TODO: Finding open rooms or creating a new one
        socket.emit('roomCode', games['game1'].room);
        socket.on('joinGame', function (room) {
            if (games[room].AddPlayer(socket.id)) {
                clients[socket.id].room = room;
                socket.join(room);
                // send the players object to the new player
                socket.emit('joinSuccessful');
                socket.emit('currentPlayers', games[room].GetAllPlayersState());
                socket.emit('currentBullets', games[room].GetAllBulletState());

                // send current game state at time of joining (let client get all data about bullet positions, etc)

                // when a player moves, update the player data
                socket.on('playerUpdate', function (updateData) {
                    var room = clients[socket.id].room;
                    games[room].UpdatePlayer(socket.id, updateData);
                    // emit a message to all players about the player that moved
                    //socket.to(room).emit('playerMoved', games[room].players[socket.id]);
                });

                // update all other players of the new player
                socket.to(room).emit('newPlayer', games[room].GetSinglePlayerState(socket.id));
            }
            else {
                socket.emit('joinFailure');
            }
        });

        socket.on('disconnect', function () {
            console.log('user disconnected');

            var room = clients[socket.id].room;
            if (room) {
                games[room].RemovePlayer(socket.id);
                io.to(room).emit('disconnect', socket.id);
            }
        });


    });

    server.listen(5000, function () {
        console.log(`Listening on ${server.address().port}`);
    });



    // Boxes






}());