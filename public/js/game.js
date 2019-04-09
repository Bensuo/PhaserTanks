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
  FIRE: 'fire'
}

var game = new Phaser.Game(config);
var mouseWheel = 0;

function preload() {
  this.load.image('tank', 'assets/tanks/tanks_tankGreen_body3.png');
  this.load.image('turret', 'assets/tanks/tanks_turret2.png');
  this.load.image('treads', 'assets/tanks/tanks_tankTracks1.png');
  this.load.image('level', 'assets/backgrounds/snowLevel.png');
  this.load.image('dot', 'assets/tanks/tank_explosion5.png');
  this.load.image('box', 'assets/tanks/tanks_crateWood.png');
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
  generateLevelGeometry(self);
}

function create() {

  var self = this;

  this.masks = this.make.graphics();

  this.masks.fillStyle(0xffffff);

  this.level = self.add.image(3850 / 2, 2170 / 2, 'level');
  var mask = this.masks.createBitmapMask(this.masks.generateTexture('texture'));
  mask.invertAlpha = true;
  this.level.setMask(mask);

  ClipperLib.Clipper.StrictlySimple = true;

  this.levelGeometry = [[
    { X: 0, Y: 1360 },
    { X: 43, Y: 1352 },
    { X: 83, Y: 1141 },
    { X: 118, Y: 1139 },
    { X: 150, Y: 962 },
    { X: 181, Y: 961 },
    { X: 206, Y: 831 },
    { X: 265, Y: 831 },
    { X: 303, Y: 1267 },
    { X: 342, Y: 1265 },
    { X: 365, Y: 1335 },
    { X: 531, Y: 1367 },
    { X: 544, Y: 1352 },
    { X: 497, Y: 1340 },
    { X: 586, Y: 1101 },
    { X: 627, Y: 1374 },
    { X: 564, Y: 1358 },
    { X: 573, Y: 1381 },
    { X: 679, Y: 1410 },
    { X: 771, Y: 1437 },
    { X: 884, Y: 1478 },
    { X: 1020, Y: 1520 },
    { X: 1023, Y: 1498 },
    { X: 992, Y: 1229 },
    { X: 941, Y: 1163 },
    { X: 965, Y: 1144 },
    { X: 1023, Y: 927 },
    { X: 1132, Y: 1105 },
    { X: 1169, Y: 1112 },
    { X: 1141, Y: 1194 },
    { X: 1142, Y: 1211 },
    { X: 1203, Y: 1211 },
    { X: 1221, Y: 1267 },
    { X: 1244, Y: 1266 },
    { X: 1264, Y: 1213 },
    { X: 1346, Y: 1213 },
    { X: 1361, Y: 1264 },
    { X: 1383, Y: 1263 },
    { X: 1390, Y: 1214 },
    { X: 1467, Y: 1213 },
    { X: 1469, Y: 1195 },
    { X: 1438, Y: 1114 },
    { X: 1475, Y: 1106 },
    { X: 1585, Y: 928 },
    { X: 1644, Y: 1144 },
    { X: 1666, Y: 1163 },
    { X: 1616, Y: 1229 },
    { X: 1588, Y: 1499 },
    { X: 1596, Y: 1534 },
    { X: 1685, Y: 1511 },
    { X: 1784, Y: 1471 },
    { X: 1858, Y: 1437 },
    { X: 1932, Y: 1407 },
    { X: 1935, Y: 1381 },
    { X: 1903, Y: 1386 },
    { X: 1915, Y: 1321 },
    { X: 1902, Y: 1321 },
    { X: 1920, Y: 1244 },
    { X: 1911, Y: 1243 },
    { X: 1927, Y: 1158 },
    { X: 1974, Y: 1249 },
    { X: 1964, Y: 1249 },
    { X: 1984, Y: 1311 },
    { X: 1969, Y: 1313 },
    { X: 1997, Y: 1370 },
    { X: 1967, Y: 1376 },
    { X: 1971, Y: 1392 },
    { X: 2114, Y: 1345 },
    { X: 2159, Y: 1233 },
    { X: 2212, Y: 1232 },
    { X: 2330, Y: 752 },
    { X: 2444, Y: 752 },
    { X: 2518, Y: 1063 },
    { X: 2556, Y: 1064 },
    { X: 2672, Y: 1330 },
    { X: 2909, Y: 1072 },
    { X: 2966, Y: 1073 },
    { X: 2986, Y: 981 },
    { X: 3139, Y: 961 },
    { X: 3270, Y: 1032 },
    { X: 3252, Y: 1131 },
    { X: 3326, Y: 1163 },
    { X: 3478, Y: 1504 },
    { X: 3519, Y: 1314 },
    { X: 3551, Y: 1314 },
    { X: 3587, Y: 1191 },
    { X: 3662, Y: 1192 },
    { X: 3710, Y: 1410 },
    { X: 3759, Y: 1391 },
    { X: 3763, Y: 1364 },
    { X: 3731, Y: 1366 },
    { X: 3744, Y: 1301 },
    { X: 3732, Y: 1301 },
    { X: 3752, Y: 1227 },
    { X: 3743, Y: 1226 },
    { X: 3761, Y: 1138 },
    { X: 3806, Y: 1233 },
    { X: 3797, Y: 1231 },
    { X: 3814, Y: 1295 },
    { X: 3802, Y: 1296 },
    { X: 3825, Y: 1352 },
    { X: 3794, Y: 1359 },
    { X: 3801, Y: 1378 },
    { X: 3839, Y: 1363 },
    { X: 3839, Y: 2108 },
    { X: 0, Y: 2109 }
  ]];

  self.graphics = self.add.graphics({ lineStyle: { width: 1, color: 0x00ff00 }, fillStyle: { color: 0xffff00 } });

  generateLevelGeometry(self);

  if (document.body.addEventListener) {
    // IE9, Chrome, Safari, Opera
    document.body.addEventListener("mousewheel", mouseWheelHandler, false);
    // Firefox
    document.body.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
  }

  this.input.on('pointerdown', function (pointer) {

    var circle = [];

    var step = 2 * Math.PI / 20;  // see note 1
    var h = pointer.worldX;
    var k = pointer.worldY;
    var r = 50;

    var circleMask = new Phaser.Geom.Circle(h, k, r);
    this.masks.fillStyle(0, 1.0);
    this.masks.fillCircleShape(circleMask);

    for (var theta = 0; theta < 2 * Math.PI; theta += step) {
      circle.push({ X: h + r * Math.cos(theta), Y: k - r * Math.sin(theta) });
    }

    var geometry = [];
    geometry.push(circle);

    damageLevelGeometry(self, geometry);

  }, this);

  var self = this;
  this.maxZoom = 100;
  this.currentZoom = 100;

  this.socket = io();
  this.otherPlayers = {};
  this.input.setPollAlways();

  self.box = self.add.image(0, 0, 'box');
  self.box.setOrigin(0.5, 0.5);

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

  this.socket.on('serverUpdate', function(state){
    //console.log('Serer update received');
    //console.log(state);
    self.lastStateUpdate = state;
  });

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

  this.wasd = {
    up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
    left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
    right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
  };

  this.cameras.main.setBounds(0, 0, 3840, 2160);
}

var pi = 3.14159265359;

function update(time, delta) {
  if (this.tank) {
    for(var key in this.lastStateUpdate.players)
    {
      var value = this.lastStateUpdate.players[key];
      if(key === this.socket.id)
      {
        this.tank.setPosition(value.x, value.y);
      }
      else if(this.otherPlayers[key]){
        this.otherPlayers[key].setPosition(value.x, value.y);
        this.otherPlayers[key].turret.rotation = value.rotation;
        
      }
    }
    // compare current state to previous
    // if it has changed, emit the current player movement
    /* var x = this.tank.x;
    var y = this.tank.y;
    var r = this.tank.turret.rotation;
    if (this.tank.oldState && (x !== this.tank.oldState.x || y !== this.tank.oldState.y || r !== this.tank.oldState.rotation)) {
      this.socket.emit('playerMovement', { x: this.tank.x, y: this.tank.y, rotation: this.tank.turret.rotation });
    } */

    var mouseX = game.input.activePointer.x;
    var mouseY = game.input.activePointer.y;

    var vec = this.cameras.main.getWorldPoint(mouseX, mouseY);

    var gun_rotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, vec.x, vec.y - turretHeightOffset);

    // apply a 90 degree offset so that the 0 to 360 degree wrap is at the bottom of the tank
    // this will allow us to clamp the valid firing directions using all directions above the tank, preventing downwards fire
    var offset = pi / 2;
    gun_rotation -= offset;
    gun_rotation = Phaser.Math.Angle.Normalize(gun_rotation);
    gun_rotation = Phaser.Math.Clamp(gun_rotation, 1.2, 5.1); // only allow firing between these angles
    // remove the offset to return to our normal rotation
    gun_rotation += offset;

    this.tank.turret.rotation = gun_rotation;

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
    var player_data = 
    {
      actions: [],
      gunRotation: gun_rotation
    }
    if (this.wasd.left.isDown) {
      player_data.actions.push(gameActions.LEFT);
    } if (this.wasd.right.isDown) {
      player_data.actions.push(gameActions.RIGHT);
    } if (this.wasd.up.isDown) {
      player_data.actions.push(gameActions.UP);
    } if (this.wasd.down.isDown) {
      player_data.actions.push(gameActions.DOWN);
    } 
    // save old position data
    this.tank.oldState = {
      x: this.tank.x,
      y: this.tank.y,
      rotation: gun_rotation
    };

    //Send player actions to the server
    this.socket.emit('playerUpdate', player_data);
  }

  this.currentZoom += (mouseWheel * ((delta / 1000) * 0.33333));

  this.currentZoom = Phaser.Math.Clamp(this.currentZoom, 0.333333, 1);

  this.cameras.main.zoom = this.currentZoom;

  // reset mouse

  mouseWheel = 0;
}