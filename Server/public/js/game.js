var config = {
    type: Phaser.AUTO,
    parent: 'phaser-tanks-game',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
  };
   

  var game = new Phaser.Game(config);

  function preload() {}
   
  function create() {
        Client.socket.on('testMsg', function()
        {
            console.log("Message received from server");
            Client.testMsg();
        });
  }
   
  function update() {}