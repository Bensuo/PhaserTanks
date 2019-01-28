var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
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

function preload() {
  this.load.image('tank', 'assets/tanks/tanks_tankGreen1.png');
  this.load.image('target', 'assets/tanks/tank_arrowEmpty.png');
}

function addPlayer(self, playerInfo) {
  self.tank = self.physics.add.image(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.target = self.add.image(playerInfo.x, playerInfo.y, 'target').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  self.tank.setDrag(100);
  self.tank.setAngularDrag(100);
  self.tank.setMaxVelocity(200);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add.sprite(playerInfo.x, playerInfo.y, 'tank').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

function create() {
  var self = this;
  this.socket = io();
  this.otherPlayers = this.add.group();
  this.input.setPollAlways();

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });

  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
      }
    });
  });

  this.wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };
}
 
function update() {
  if (this.tank) {

    var mouseX = game.input.activePointer.x;
    var mouseY = game.input.activePointer.y;

    // emit player movement
    var x = this.tank.x;
    var y = this.tank.y;
    var r = this.tank.rotation;
    if (this.tank.oldPosition && (x !== this.tank.oldPosition.x || y !== this.tank.oldPosition.y || r !== this.tank.oldPosition.rotation)) {
      this.socket.emit('playerMovement', { x: this.tank.x, y: this.tank.y, rotation: this.tank.rotation });
    }

    this.target.x = this.tank.x;
    this.target.y = this.tank.y;

    var rot = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, mouseX, mouseY);

    this.target.rotation = rot;

    // save old position data
    this.tank.oldPosition = {
      x: this.tank.x,
      y: this.tank.y,
      rotation: this.tank.rotation
    };

    if (this.wasd.left.isDown) {
        this.tank.setVelocity(-150, 0);
    } else if (this.wasd.right.isDown) {
      this.tank.setVelocity(150, 0);
    } else {
      this.tank.setVelocity(0, 0);
    }
  }
}