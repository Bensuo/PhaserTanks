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
  this.load.image('tank', 'assets/tanks/tanks_tankGreen_body3.png');
  this.load.image('turret', 'assets/tanks/tanks_turret2.png');
  this.load.image('treads', 'assets/tanks/tanks_tankTracks1.png');
}

var turretHeightOffset = -18;

function addPlayer(self, playerInfo) {

  var turret = self.add.image(0, turretHeightOffset, 'turret').setOrigin(0.04, 0.5);
  var treads = self.add.image(0, 24, 'treads').setOrigin(0.5, 0.5);
  var armor = self.add.image(0, 0, 'tank').setOrigin(0.5, 0.5);

  self.tank = self.add.container(playerInfo.x, playerInfo.y, [ turret, treads, armor ]);

  self.tank.armor = armor;
  self.tank.turret = turret;
  self.tank.treads = treads;

  self.tank.setSize(90, 50);

  self.physics.world.enable(self.tank);
}

function addOtherPlayers(self, playerInfo) {
  
  var turret = self.add.image(0, turretHeightOffset, 'turret').setOrigin(0.04, 0.5);
  var treads = self.add.image(0, 24, 'treads').setOrigin(0.5, 0.5);
  var armor = self.add.image(0, 0, 'tank').setOrigin(0.5, 0.5);

  otherPlayer = self.add.container(playerInfo.x, playerInfo.y, [ turret, treads, armor ]);

  otherPlayer.armor = armor;
  otherPlayer.turret = turret;
  otherPlayer.treads = treads;

  otherPlayer.setSize(90, 50);

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
        otherPlayer.turret.setRotation(playerInfo.rotation);
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

var pi = 3.14159265359;
 
function update() {
  if (this.tank) {
    
    // compare current state to previous
    // if it has changed, emit the current player movement
    var x = this.tank.x;
    var y = this.tank.y;
    var r = this.tank.turret.rotation;
    if (this.tank.oldState && (x !== this.tank.oldState.x || y !== this.tank.oldState.y || r !== this.tank.oldState.rotation)) {
      this.socket.emit('playerMovement', { x: this.tank.x, y: this.tank.y, rotation: this.tank.turret.rotation });
    }

    var mouseX = game.input.activePointer.x;
    var mouseY = game.input.activePointer.y;

    var gun_rotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, mouseX, mouseY - turretHeightOffset);

    // apply a 90 degree offset so that the 0 to 360 degree wrap is at the bottom of the tank
    // this will allow us to clamp the valid firing directions using all directions above the tank, preventing downwards fire
    var offset = pi / 2;
    gun_rotation -= offset;
    gun_rotation = Phaser.Math.Angle.Normalize(gun_rotation);
    gun_rotation = Phaser.Math.Clamp(gun_rotation, 1.2, 5.1); // only allow firing between these angles
    // remove the offset to return to our normal rotation
    gun_rotation += offset;

    this.tank.turret.rotation = gun_rotation;

    if (this.wasd.left.isDown) {
        this.tank.body.setVelocity(-150, 0);
    } else if (this.wasd.right.isDown) {
      this.tank.body.setVelocity(150, 0);
    } else {
      this.tank.body.setVelocity(0, 0);
    }

    // save old position data
    this.tank.oldState = {
      x: this.tank.x,
      y: this.tank.y,
      rotation: gun_rotation
    };
  }
}