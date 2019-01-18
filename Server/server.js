var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var p2 = require('p2');
var gameLoop = require('./gameLoop');

app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket){
    console.log('A user connected');
    socket.on('disconnect', function()
    {
        console.log('A user disconnected');
    });
});

io.on('testMsg', function (socket)
{
    console.log(`Message received from client: ${socket.id}`);
});
server.listen(8081, function(){
    console.log(`Listening on ${server.address().port}`);
});
gameLoop.update = function(delta)
{
    console.log("update called");
    Object.keys(io.sockets.connected).forEach (function(socket){
        io.sockets.connected[socket].emit('testMsg');
        console.log("test msg sent");
    });
};
gameLoop.run();