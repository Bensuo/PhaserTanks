var Client = {};

Client.socket = io.connect();

Client.newPlayer = function()
{
    this.socket.emit('newPlayer');
};

Client.testMsg = function()
{
    this.socket.emit('testMsg');
    console.log("Sending test mesage");
};