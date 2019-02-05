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
 
var game = new Phaser.Game(config);
var mouseWheel = 0;

function preload() {
  this.load.image('tank', 'assets/tanks/tanks_tankGreen_body3.png');
  this.load.image('turret', 'assets/tanks/tanks_turret2.png');
  this.load.image('treads', 'assets/tanks/tanks_tankTracks1.png');
  this.load.image('level', 'assets/backgrounds/snowLevel.png');
  this.load.image('dot', 'assets/tanks/tank_explosion5.png');
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

  self.cameras.main.startFollow(self.tank, true, 0.2, 0.2);
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

function mouseWheelHandler(e) {

	// cross-browser wheel delta
	var e = window.event || e; // old IE support
  mouseWheel = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
}

function create() {

    var polygon = new Phaser.Geom.Polygon([
      0, 1360.3333334568413,
      43, 1352.3333333333371,
      83, 1141.333333333339,
      118, 1139.333333333339,
      150, 962.6666667422439,
      181, 961.6666666666744,
      206, 831.6666666666733,
      265, 831.6666666666733,
      303, 1267.6666598109841,
      342, 1265.6666666666695,
      365, 1335.6666666666695,
      531, 1367.6666666666695,
      544, 1352.6666666666695,
      497, 1340.6666666666695,
      586, 1101.0000000000055,
      627, 1374.0000000000055,
      564, 1358.0000000000055,
      573, 1381.0000000000055,
      679.0000000000019, 1410.0000000000011,
      771.0000000000019, 1437.0000000000011,
      884.0000000000019, 1478.0000000000011,
      1020.0000000000019, 1520.0000000000011,
      1023.0000000000019, 1498.0000000000011,
      992.0000000000019, 1229.0000000000205,
      941.0000000000019, 1163.000000000004,
      965.0000000000019, 1144.000000000004,
      1023.0000000000019, 927.6666666666789,
      1132.0000000000018, 1105.6666666666729,
      1169.0000000000018, 1112.6666666666729,
      1141.0000000000018, 1194.6666666666729,
      1142.0000000000018, 1211.6666666666729,
      1203.0000000000018, 1211.6666666666729,
      1221.0000000000018, 1267.6666666666729,
      1244.0000000000018, 1266.6666666666729,
      1264.0000000000018, 1213.6666666666729,
      1346.0000000000018, 1213.6666666666729,
      1361.0000000000018, 1264.6666666666729,
      1383.0000000000018, 1263.6666666666729,
      1390.0000000000018, 1214.6666666666729,
      1467.999999999999, 1213.6666666666697,
      1469.999999999999, 1195.6666666666697,
      1438.999999999999, 1114.6666666666697,
      1475.999999999999, 1106.000000000006,
      1585.999999999999, 928.0000000000059,
      1644.999999999999, 1144.000000000006,
      1666.999999999999, 1163.000000000006,
      1616.999999999999, 1229.000000000006,
      1588.999999999999, 1499.666666077752,
      1596.999999999999, 1534.6666666666686,
      1685.999999999999, 1511.6666666666686,
      1784.3333333321937, 1471.333333334978,
      1858.33333333333, 1437.3333333333364,
      1932.33333333333, 1407.3333333333364,
      1935.33333333333, 1381.3333333333364,
      1903.33333333333, 1386.3333333333364,
      1915.33333333333, 1321.3333333333364,
      1902.33333333333, 1321.3333333333364,
      1920.33333333333, 1244.3333333333364,
      1911.33333333333, 1243.3333333333364,
      1927.33333333333, 1158.6666666672033,
      1974.33333333333, 1249.6666666666706,
      1964.33333333333, 1249.6666666666706,
      1984.33333333333, 1311.6666666666706,
      1969.33333333333, 1313.6666666666706,
      1997.33333333333, 1370.6666666666706,
      1967.33333333333, 1376.6666666666706,
      1971.33333333333, 1392.6666666666706,
      2114.3333333333303, 1345.6666666666706,
      2159.3333333333303, 1233.6666666666706,
      2212.3333333333303, 1232.6666666666706,
      2330.333333333327, 752.000000000006,
      2444.333333333327, 752.000000000006,
      2518.9999999999945, 1063.0000000000048,
      2556.9999999999945, 1064.0000000000048,
      2672.666666666668, 1330.3333333333374,
      2909.6666666666683, 1072.3333333333374,
      2966.6666666666683, 1073.3333333333374,
      2986.000000000011, 981.3333333333389,
      3139.000000000011, 961.3333333333389,
      3270.000000000011, 1032.333333333339,
      3252.000000000011, 1131.333333333339,
      3326.000000000011, 1163.333333333339,
      3478, 1504.6666666666683,
      3519, 1314.6666666666683,
      3551, 1314.6666666666683,
      3587, 1191.666666707093,
      3662, 1192.6666666666713,
      3710, 1410.6666666666713,
      3759, 1391.6666666666713,
      3763, 1364.6666666666713,
      3731, 1366.6666666666713,
      3744, 1301.6666666666713,
      3732, 1301.6666666666713,
      3752, 1227.6666666666713,
      3743, 1226.6666666666713,
      3761, 1138.6666666666713,
      3806, 1233.6666666666713,
      3797, 1231.6666666666713,
      3814, 1295.6666666666713,
      3802, 1296.6666666666713,
      3825, 1352.6666666666713,
      3794, 1359.6666666666713,
      3801, 1378.6666666666713,
      3839, 1363.6666666666713,
      3839, 2108,
      0, 2109
  ]);

  var graphics = this.add.graphics({ x: 0, y: 0 });

  graphics.lineStyle(4, 0x00aa00);

  graphics.beginPath();

  graphics.moveTo(polygon.points[0].x, polygon.points[0].y);

  for (var i = 1; i < polygon.points.length; i++)
  {
      graphics.lineTo(polygon.points[i].x, polygon.points[i].y);
  }

  graphics.closePath();
  graphics.strokePath();

  if (document.body.addEventListener) {
    // IE9, Chrome, Safari, Opera
    document.body.addEventListener("mousewheel", mouseWheelHandler, false);
    // Firefox
    document.body.addEventListener("DOMMouseScroll", mouseWheelHandler, false);
  }

  this.input.on('pointerdown', function (pointer) {
    this.add.image(pointer.worldX, pointer.worldY, 'dot');
    console.log(pointer.worldX, pointer.worldY);
  }, this);

  var self = this;
  this.maxZoom = 100;
  this.currentZoom = 100;

  this.socket = io();
  this.otherPlayers = this.add.group();
  this.input.setPollAlways();

  this.level = self.add.image(3850 / 2, 2170 / 2, 'level');
  
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

  this.cameras.main.setBounds(0, 0, 3840, 2160);
}

var pi = 3.14159265359;

function update(time, delta) {
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

    if (this.wasd.left.isDown) {
        this.tank.body.setVelocity(-500, 0);
    } else if (this.wasd.right.isDown) {
      this.tank.body.setVelocity(500, 0);
    } else if (this.wasd.up.isDown) {
        this.tank.body.setVelocity(0, -500);
    } else if (this.wasd.down.isDown) {
          this.tank.body.setVelocity(0, 500);
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

  this.currentZoom += (mouseWheel * ((delta / 1000) * 0.33333));

  this.currentZoom = Phaser.Math.Clamp(this.currentZoom, 0.333333, 1);

  this.cameras.main.zoom = this.currentZoom;

  // reset mouse
 
  mouseWheel = 0;
}