var config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 1280,
  height: 720,
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

const gameActions = {
  UP: 'up',
  LEFT: 'left',
  RIGHT: 'right',
  DOWN: 'down',
  TILT_LEFT: 'tilt_left',
  TILT_RIGHT: 'tilt_right',
  FIRE: 'fire',
}

var playerData =
{
  actions: [],
  gunRotation: 0
}

var game = new Phaser.Game(config);
var mouseWheel = 0;

const BLAST_RADIUS = 100;

const MAX_BULLET_COUNT = 100;

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
};

function preload() {
  this.load.image('tank', 'assets/tanks/tanks_tankGreen_body3.png');
  this.load.image('turret', 'assets/tanks/tanks_turret2.png');
  this.load.image('treads', 'assets/tanks/tanks_tankTracks1.png');
  this.load.image('level', 'assets/backgrounds/snowLevel.png');
  this.load.image('levelBG', 'assets/backgrounds/snowLevelBG.png');
  this.load.image('dot', 'assets/tanks/tank_explosion5.png');
  this.load.image('box', 'assets/tanks/tanks_crateWood.png');
  this.load.image('bullet', 'assets/tanks/tank_bullet3.png');
}

var turretHeightOffset = -18;

function addPlayer(self, playerInfo) {

  var turret = self.add.image(0, turretHeightOffset, 'turret').setOrigin(0.04, 0.5);
  var treads = self.add.image(0, 24, 'treads').setOrigin(0.5, 0.5);
  var armor = self.add.image(0, 0, 'tank').setOrigin(0.5, 0.5);

  self.tank = self.add.container(playerInfo.x, playerInfo.y, [turret, treads, armor]);

  self.tank.armor = armor;
  self.tank.turret = turret;
  self.tank.treads = treads;

  self.tank.setSize(90, 50);

  self.physics.world.enable(self.tank);

  self.cameras.main.startFollow(self.tank, true, 0.2, 0.2);
}

function addOtherPlayers(self, playerInfo) {

  var turret = self.add.image(0, turretHeightOffset, 'turret').setOrigin(0.04, 0.5);
  var treads = self.add.image(0, 24, 'treads').setOrigin(0.5, 0.5);
  var armor = self.add.image(0, 0, 'tank').setOrigin(0.5, 0.5);

  otherPlayer = self.add.container(playerInfo.x, playerInfo.y, [turret, treads, armor]);

  otherPlayer.armor = armor;
  otherPlayer.turret = turret;
  otherPlayer.treads = treads;

  otherPlayer.setSize(90, 50);

  //otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers[playerInfo.playerId] = otherPlayer;
}

function addBullets(self) {

  for(var i = 0; i < MAX_BULLET_COUNT; ++i)
  {
    var bullet = self.add.image(0, 0, 'bullet').setOrigin(0.5, 0.5);
    bullet.rotation = 0;
    newBullet = self.add.container(0, 0, [bullet]);
    newBullet.bullet = bullet;
    newBullet.setSize(50, 50);
  
    self.bullets.push(newBullet);
  }
}

function mouseWheelHandler(e) {

  // cross-browser wheel delta
  var e = window.event || e; // old IE support
  mouseWheel = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
}

function generateLevelGeometry(self) {

  self.graphics.clear();

  self.levelGeometry.forEach(function (path) {
    var levelGeometryPoly = path.map(function (val) {
      return new poly2tri.Point(val.X, val.Y);
    });

    self.swctx = new poly2tri.SweepContext(levelGeometryPoly);

    self.swctx.triangulate();
    self.triangles = self.swctx.getTriangles();

    self.triangles.forEach(function (t) {

      triangle = new Phaser.Geom.Triangle(t.getPoint(0).x, t.getPoint(0).y, t.getPoint(1).x, t.getPoint(1).y, t.getPoint(2).x, t.getPoint(2).y);
      self.graphics.strokeTriangleShape(triangle);

    });
  });
}

function damageLevelGeometry(self, damagePath) {
  var cpr = new ClipperLib.Clipper();
  cpr.AddPaths(self.levelGeometry, ClipperLib.PolyType.ptSubject, true);
  cpr.AddPaths(damagePath, ClipperLib.PolyType.ptClip, true);
  var newGeometry = new ClipperLib.Paths();
  var succeeded = cpr.Execute(ClipperLib.ClipType.ctDifference, newGeometry, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
  newGeometry = ClipperLib.Clipper.CleanPolygons(newGeometry, 0.1);
  self.levelGeometry = ClipperLib.Clipper.SimplifyPolygons(newGeometry, ClipperLib.PolyFillType.pftNonZero);
  //drawGeometry(self);
}

function drawGeometry(self) {
  self.graphics.clear();
  self.graphics.beginPath();
  for (let i = 0; i < self.levelGeometry.length; i++) {
    var path = self.levelGeometry[i];
    self.graphics.moveTo(path[0].X, path[0].Y);
    for (let j = 0; j < path.length; j++) {
      const point = path[j];
      self.graphics.lineTo(point.X, point.Y);
    }
    self.graphics.closePath();
    self.graphics.strokePath();
  }
}

function create() {

  var self = this;

  this.masks = this.make.graphics({ fillStyle: { color: 0xffffff }, add: false})

  this.levelBG = self.add.image(3850 / 2, 2170 / 2, 'levelBG');
  this.level = self.add.image(3850 / 2, 2170 / 2, 'level');
  var mask = this.masks.createBitmapMask(this.masks.generateTexture('texture'));
  mask.invertAlpha = true;
  this.level.setMask(mask);

  ClipperLib.Clipper.StrictlySimple = true;
  this.levelGeometry = [[]];
  var src = this.textures.get('level').getSourceImage();
  var canvas = this.textures.createCanvas('march', src.width, src.height).draw(0, 0, src);
  var outline = MarchingSquaresOpt.getBlobOutlinePoints(canvas.data, canvas.width, canvas.height);
  for (let i = 0; i < outline.length; i += 32) {
    this.levelGeometry[0].push({ X: outline[i], Y: outline[i + 1] });

  }

  self.graphics = self.add.graphics({ lineStyle: { width: 4, color: 0xaa6622 } });
  //drawGeometry(self);
  //self.graphics.fillRect(0,0,3850, 2170);

  //generateLevelGeometry(self);

  if (document.body.addEventListener) {
    // IE9, Chrome, Safari, Opera
    document.body.addEventListener("mousewheel", mouseWheelHandler, false);
    // Firefox
    document.body.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
  }

  this.maxZoom = 100;
  this.currentZoom = 100;

  this.socket = io();
  this.otherPlayers = {};
  this.lastStateUpdate = {};
  this.bullets = [];
  this.input.setPollAlways();
  this.explosionsPending = [];

  self.box = self.add.image(0, 0, 'box');
  self.box.setOrigin(0.5, 0.5);

  this.input.on('pointerdown', function (pointer) {
    playerData.actions.push(gameActions.FIRE);
  }, this);

  this.socket.on('explosions', function (explosions) {
    for (let i = 0; i < explosions.length; i++) {
      const explosion = explosions[i];
      self.explosionsPending.push(explosion);
    }
    
  })

  this.socket.on('roomCode', function (roomCode) {
    this.emit('joinGame', roomCode);
    this.on('joinSucessful', function () { console.log('Join success!') });
    this.on('joinFailure', function () { console.log('Join failure!') });
  })

  this.socket.on('box', function (boxState) {
    self.box.x = boxState.x;
    self.box.y = boxState.y;
    self.box.rotation = boxState.r;
  });


  this.socket.on('serverUpdate', function (state) {
    //console.log('Serer update received');
    //console.log(state);
    self.lastStateUpdate = state;
  });

  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.uniqueID) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on('newPlayer', function (playerInfo) {
    addOtherPlayers(self, playerInfo);
  });

  /* this.socket.on('playerMoved', function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.turret.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  }); */

  this.socket.on('disconnect', function (playerId) {
    self.otherPlayers[playerId].destroy();
    delete self.otherPlayers[playerId];
    console.log(self.otherPlayers);
  });

  this.keys = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    tiltLeft: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
    tiltRight: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E)
  };

  this.cameras.main.setBounds(0, 0, 3840, 2160);

  addBullets(self);
  //Tell the server we wish to join a new game
  this.socket.emit('requestNewGame');
  this.socket.on('id', function(id){
    self.uniqueID = id;
  });
  this.socket.on('waitingForRoom', function()
  {
      //Display waiting for room message
      console.log('Waiting for room...');
      self.socket.on('waitingToStart', function(info)
      {
        console.log('Waiting to join game, info: ', info);
        self.socket.emit('waitingToStart');
      });
      self.socket.on('readyToStart', function(){
        console.log('Game is ready, confirming ready status');
        self.socket.emit('confirmReady');
        self.socket.on('gameStarted', function(){
          console.log('Game started!');
        })
        //Start gameplay somehow
      }
      );
  });
}

var pi = 3.14159265359;

function updateExplosions(self) {

  self.explosionsPending.forEach(function (explosion) {
    var circle = [];

    var step = 2 * Math.PI / 20;  // see note 1
    var h = explosion.worldX * 32.0;
    var k = explosion.worldY * 32.0;
    var r = BLAST_RADIUS;

    var circleMask = new Phaser.Geom.Circle(h, k, r);
    self.masks.fillStyle(0, 1.0);
    self.masks.fillCircleShape(circleMask);

    for (var theta = 0; theta < 2 * Math.PI; theta += step) {
      circle.push({ X: h + r * Math.cos(theta), Y: k - r * Math.sin(theta) });
    }

    var geometry = [];
    geometry.push(circle);

    damageLevelGeometry(self, geometry);
  });

  self.explosionsPending = [];
}

function update(time, delta) {

  updateExplosions(this);

  if (this.tank) {
    for (var key in this.lastStateUpdate.players) {
      var value = this.lastStateUpdate.players[key];

      if (key === this.uniqueID) {
        this.tank.setPosition(value.x * 32.0, value.y * 32.0);
        this.tank.rotation = value.rotation;
      }

      else if (this.otherPlayers[key]) {
        this.otherPlayers[key].setPosition(value.x * 32.0, value.y * 32.0);
        this.otherPlayers[key].rotation = value.rotation;
        this.otherPlayers[key].turret.rotation = value.gunRotation;
      }
    }

    if (this.lastStateUpdate.bullets) {

      var arrayLength = clamp(this.lastStateUpdate.bullets.length, 0, MAX_BULLET_COUNT);

      for (var i = 0; i < arrayLength; i++) {
        this.bullets[i].visible = true;
        this.bullets[i].rotation = this.lastStateUpdate.bullets[i].rotation;
        this.bullets[i].x = this.lastStateUpdate.bullets[i].x * 32.0;
        this.bullets[i].y = this.lastStateUpdate.bullets[i].y * 32.0;
      }

      var leftOverBullets = this.bullets.length - arrayLength;
      for (var i = arrayLength; i < leftOverBullets; i++) {
        this.bullets[i].visible = false;
      }
    }

    var mouseX = game.input.activePointer.x;
    var mouseY = game.input.activePointer.y;

    var vec = this.cameras.main.getWorldPoint(mouseX, mouseY);

    // calculate gun direction in local space
    playerData.gunRotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, vec.x, vec.y - turretHeightOffset);

    // apply a 90 degree offset so that the 0 to 360 degree wrap is at the bottom of the tank
    // this will allow us to clamp the valid firing directions using all directions above the tank, preventing downwards fire
    var offset = pi / 2;
    playerData.gunRotation -= offset;
    playerData.gunRotation -= this.tank.rotation;
    playerData.gunRotation = Phaser.Math.Angle.Normalize(playerData.gunRotation);
    playerData.gunRotation = Phaser.Math.Clamp(playerData.gunRotation, 1.2, 5.1); // only allow firing between these angles
    // remove the offset to return to our normal rotation
    playerData.gunRotation += offset;

    this.tank.turret.rotation = playerData.gunRotation;

    /* if (this.wasd.left.isDown) {
      this.tank.body.setVelocity(-500, 0);
    } else if (this.wasd.right.isDown) {
      this.tank.body.setVelocity(500, 0);
    } else if (this.wasd.up.isDown) {
      this.tank.body.setVelocity(0, -500);
    } else if (this.wasd.down.isDown) {
      this.tank.body.setVelocity(0, 500);
    } else {
      this.tank.body.setVelocity(0, 0);
    } */

    if (this.keys.left.isDown) {
      playerData.actions.push(gameActions.LEFT);
    } if (this.keys.right.isDown) {
      playerData.actions.push(gameActions.RIGHT);
    } if (this.keys.up.isDown) {
      playerData.actions.push(gameActions.UP);
    } if (this.keys.down.isDown) {
      playerData.actions.push(gameActions.DOWN);
    } if (this.keys.tiltLeft.isDown) {
      playerData.actions.push(gameActions.TILT_LEFT);
    } if (this.keys.tiltRight.isDown) {
      playerData.actions.push(gameActions.TILT_RIGHT);
    }

    //Send player actions to the server
    this.socket.emit('playerUpdate', playerData);

    playerData.actions = [];
  }

  this.currentZoom += (mouseWheel * ((delta / 1000) * 0.33333));

  this.currentZoom = Phaser.Math.Clamp(this.currentZoom, 0.333333, 1);

  this.cameras.main.zoom = this.currentZoom;

  // reset mouse

  mouseWheel = 0;
}