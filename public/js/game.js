const BLAST_RADIUS = 100;
const MAX_BULLET_COUNT = 100;
const TURRET_HEIGHT_OFFSET = -15;
const TREAD_HEIGHT_OFFSET = 24;
const MAX_HEALTH = 100;
const HEALTH_BAR_WIDTH = 100;
const HEALTH_BAR_HEIGHT = 10;
const WORLD_SCALE = 32;
const MAX_ZOOM = 100;
const BLACK = 0x000000;
const HEALTH_BAR_FG = 0x2ECC71;
const HEALTH_BAR_BG = 0xFF2D39;
const PlayerEvents =
{
  KILLED: 'killed',
  EXPLODED: 'exploded',
  FIRE_FAILED: 'fire_failed',
  FIRED: 'fired',
  SPAWNED: 'spawned',
  BOOST_UP: 'boost_up',
  BOOST_LEFT: 'boost_left',
  BOOST_RIGHT: 'boost_right',
}

var PLAYER_NAME = "";

function lerp(v0, v1, t) {
  return v0 * (1 - t) + v1 * t
}

class Bootstrap extends Phaser.Scene {
  constructor() {
    super('Bootstrap');
  }

  preload() {
    this.load.image('sand', 'assets/menu/sand.png');
    this.load.image('water', 'assets/menu/water.png');
    this.load.image('fish1', 'assets/menu/fish1.png');
    this.load.image('fish2', 'assets/menu/fish2.png');
    this.load.image('fish3', 'assets/menu/fish3.png');
    this.load.image('fish4', 'assets/menu/fish4.png');
    this.load.image('fish5', 'assets/menu/fish5.png');
    this.load.image('tank1', 'assets/tanks/tank1.png');
    this.load.image('tank2', 'assets/tanks/tank2.png');
    this.load.image('tank3', 'assets/tanks/tank3.png');
    this.load.image('tank4', 'assets/tanks/tank4.png');
    this.load.image('tankGun1', 'assets/tanks/tankGun1.png');
    this.load.image('tankGun2', 'assets/tanks/tankGun2.png');
    this.load.image('tankGun3', 'assets/tanks/tankGun3.png');
    this.load.image('tankGun4', 'assets/tanks/tankGun4.png');
    this.load.image('turret', 'assets/tanks/tanks_turret2.png');
    this.load.image('treads1', 'assets/tanks/tanks_tankTracks1.png');
    this.load.image('treads2', 'assets/tanks/tanks_tankTracks1.png');
    this.load.image('treads3', 'assets/tanks/tanks_tankTracks2.png');
    this.load.image('treads4', 'assets/tanks/tanks_tankTracks2.png');
    this.load.image('level', 'assets/backgrounds/snowLevel.png');
    this.load.image('levelBG', 'assets/backgrounds/snowLevelBG.png');
    this.load.image('cloudsFar', 'assets/backgrounds/cloudLayerB2.png');
    this.load.image('cloudsMid', 'assets/backgrounds/cloudLayerB1.png');
    this.load.image('cloudsNear', 'assets/backgrounds/cloudLayer2.png');
    this.load.image('landFar', 'assets/backgrounds/mountains.png');
    this.load.image('landMid', 'assets/backgrounds/hillsLarge.png');
    this.load.image('landNear', 'assets/backgrounds/hills.png');
    this.load.image('groundNear', 'assets/backgrounds/hills.png');

    this.load.image('dot', 'assets/tanks/tank_explosion5.png');
    this.load.image('bullet', 'assets/tanks/tank_bullet3.png');
    this.load.audio('bg-loop', 'assets/audio/sfx/underwater loop.ogg');
    this.load.audio('engine-loop', 'assets/audio/sfx/engine loop.ogg');
    this.load.audio('rocket-loop', 'assets/audio/sfx/rocket loop.ogg');
    this.load.audio('bubble-loop', 'assets/audio/sfx/bubbling loop.ogg');
    this.load.audio('bg-music', 'assets/audio/sfx/March of the Goldfish lpf.ogg');
    this.load.audio('menu-music', 'assets/audio/sfx/menu music.ogg');
    this.load.audio('explosion', 'assets/audio/sfx/combined explosion.ogg');
    this.load.audio('tank-fire', 'assets/audio/sfx/tank fire.ogg');
    this.load.audio('gun-click', 'assets/audio/sfx/gun click.ogg');
    this.load.spritesheet('boom', 'assets/tanks/explosion.png', { frameWidth: 128, frameHeight: 128, endFrame: 4 });
    this.load.spritesheet('flash', 'assets/tanks/muzzleFlash.png', { frameWidth: 124, frameHeight: 42 });
    this.load.image('back', 'assets/menu/back.png');
    this.load.image('highScores', 'assets/menu/highScores.png');
    this.load.image('logo', 'assets/menu/logo.png');
    this.load.image('play', 'assets/menu/play.png');
    this.load.image('scores', 'assets/menu/scores.png');
    this.load.image('victory', 'assets/menu/victory.png');
    this.load.image('draw', 'assets/menu/draw.png');
    this.load.atlas('shapes', 'assets/shapes.png', 'assets/shapes.json');
    this.load.text('particle-effect', 'assets/particle-effect.json');
    this.load.text('tank_particle', 'assets/tank_particle.json');
    this.load.text('explosion', 'assets/explosion.json');
  }

  create() {
    this.scene.start('MenuBG');
    this.scene.start('ClickToStart');
  }
}

class MenuBG extends Phaser.Scene {

  constructor() {
    super('MenuBG');
  }

  create() {
    var self = this;
    this.music = this.sound.add('menu-music', { volume: 0.15, loop: true });
    this.music.play();
    var centerX = self.cameras.main.centerX;
    var centerY = self.cameras.main.centerY;

    this.water = this.add.tileSprite(centerX, 600, 1920, 2172, 'water');
    this.sand = this.add.tileSprite(centerX, centerY, self.cameras.main.width, self.cameras.main.height, 'sand');
    this.fish1 = this.add.tileSprite(centerX, self.cameras.main.height / 3, self.cameras.main.width, 61, 'fish1');
    this.fish2 = this.add.tileSprite(centerX, self.cameras.main.height / 2.5, self.cameras.main.width, 83, 'fish2');
    this.fish3 = this.add.tileSprite(centerX, self.cameras.main.height / 1.45, self.cameras.main.width, 113, 'fish3');
    this.fish4 = this.add.tileSprite(centerX, self.cameras.main.height / 2, self.cameras.main.width, 113, 'fish4');
    this.fish5 = this.add.tileSprite(centerX, self.cameras.main.height / 1.66, self.cameras.main.width, 138, 'fish5');
  }

  update(time, delta) {
    this.water.tilePositionX += 0.1;
    this.sand.tilePositionX += 0.5;
    this.fish1.tilePositionX -= 1.25;
    this.fish2.tilePositionX -= 1;
    this.fish3.tilePositionX -= 0.5;
    this.fish4.tilePositionX -= 0.75;
    this.fish5.tilePositionX -= 0.25;
  }
}

class ClickToStart extends Phaser.Scene {
  constructor() {
    super('ClickToStart');
  }

  create() {
    this.title = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 0.8, 'Click To Start', { font: '64px Monospace', fill: '#ffffff', align: 'center' });
    this.title.setOrigin(0.5, 0.5);
    this.input.on('pointerdown', function (pointer) {
      this.scene.start('NameEntry');
    }, this);
  }
}

class NameEntry extends Phaser.Scene {
  constructor() {
    super('NameEntry')
  }

  create() {
    this.title = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 0.8, 'Enter your name (1-16 characters):', { font: '64px Monospace', fill: '#ffffff', align: 'center' });
    this.title.setOrigin(0.5, 0.5);
    //this.title.setAlign('center');
    this.textEntry = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY * 1.2, '', { font: '48px Monospace', fill: '#ffff00' });
    this.textEntry.setOrigin(0.5, 0.5);
    //this.keys = this.input.keyboard.addKeys('A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,0,1,2,3,4,5,6,7,8,9,!,?,BACKSPACE');
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyBackspace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    var self = this;
    this.input.keyboard.on('keydown', function (event) {

      if (event.keyCode === 8 && self.textEntry.text.length > 0) {
        self.textEntry.text = self.textEntry.text.substr(0, self.textEntry.text.length - 1);
      }
      else if ((event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode < 90)) && self.textEntry.text.length <= 16) {
        self.textEntry.text += event.key;
      }
      else if (event.keyCode == 13 && self.textEntry.text.length > 0) {
        PLAYER_NAME = self.textEntry.text;
        self.scene.start('MainMenu');
      }

    });
  }

  update() {

  }
}

class GameLoad extends Phaser.Scene {

  constructor() {
    super('GameLoad');
  }

  create() {

    var self = this;

    self.socket = io();

    var msgConfig = { font: '48px Monospace', fill: '#ffffff', align: 'center' };

    this.msg1 = self.add.text(self.cameras.main.centerX, self.cameras.main.centerY * 0.3, 'Requesting a new game!', msgConfig);
    this.msg1.setOrigin(0.5, 0.5);

    self.socket.emit('requestNewGame');

    self.socket.on('id', function (id) {
      self.uniqueID = id;

      self.socket.on('waitingForRoom', function () {
        self.msg1.setText("Waiting for a room...");
        
        self.socket.on('waitingToStart', function (info) {
          self.msg1.setText(`Room found! Waiting for players: ${info.playerCount}/${info.maxPlayers}`);
          self.socket.emit('waitingToStart');
        });

        self.socket.on('readyToStart', function () {
          self.msg1.setText("Game is ready, confirming ready status...");
          self.scene.get('MenuBG').sound.stopAll();
          self.scene.stop('MenuBG');
          self.scene.start('GameScene', { socket: self.socket, uniqueID: self.uniqueID });
          self.scene.start('HUD');
        });
      });
    });
  }

  update(time, delta) {
  }
}

class HighScores extends Phaser.Scene {

  constructor() {
    super('HighScores');
  }

  create() {
    this.socket = io();

    var self = this;

    this.logo = this.add.image(self.cameras.main.centerX, self.cameras.main.centerY, 'highScores');

    this.back = this.add.image(self.cameras.main.centerX, self.cameras.main.height / 1.15, 'back')
      .setInteractive()
      .on('pointerdown', function () {
        self.socket.disconnect();
        self.scene.start('MainMenu');
      });

    this.socket.emit('requestHighScores', 10);
    this.socket.on('highScores', function (highScores) {
      for (var i = 0; i < highScores.length; ++i) {
        var score = highScores[i];

        var entry = self.add.text(self.cameras.main.centerX, self.cameras.main.centerY * 0.6333 + (i * 42), `${score.name}: ${score.score}`, { font: '48px Monospace', fill: '#ffffff', align: 'center' });
        entry.setOrigin(0.5, 0.5);
      }
    });
  }

  pulse(time, bias) {
    var scale = Math.sin(time / 2000.0);
    scale += bias;
    scale /= bias + 1;
    return scale;
  }

  update(time, delta) {

    var logoScale = this.pulse(time, 10);
    this.logo.scaleX = logoScale;
    this.logo.scaleY = logoScale;

    var buttonScale = this.pulse(time, 15);
    this.back.scaleX = buttonScale;
    this.back.scaleY = buttonScale;
  }
}

class MainMenu extends Phaser.Scene {

  constructor() {
    super({ key: 'MainMenu' });
  }

  create() {
    var self = this;

    this.logo = this.add.image(self.cameras.main.centerX, self.cameras.main.height / 3.25, 'logo');

    this.play = this.add.image(self.cameras.main.centerX, self.cameras.main.height / 1.45, 'play')
      .setInteractive()
      .on('pointerdown', function () {
        self.scene.start('GameLoad');
      });

    this.scores = this.add.image(self.cameras.main.centerX, self.cameras.main.height / 1.15, 'scores')
      .setInteractive()
      .on('pointerdown', function () {
        self.scene.start('HighScores');
      });
  }

  pulse(time, bias) {
    var scale = Math.sin(time / 2000.0);
    scale += bias;
    scale /= bias + 1;
    return scale;
  }

  update(time, delta) {

    var logoScale = this.pulse(time, 10);
    this.logo.scaleX = logoScale;
    this.logo.scaleY = logoScale;

    var buttonScale = this.pulse(time, 15);
    this.play.scaleX = buttonScale;
    this.play.scaleY = buttonScale;
    this.scores.scaleX = buttonScale;
    this.scores.scaleY = buttonScale;
  }
}

class HUD extends Phaser.Scene {

  constructor() {
    super('HUD');
  }

  create() {
    var config = { font: '32px Monospace', fill: '#ffffff' };

    this.timerLabel = this.add.text(10, 0, '', config).setDepth(1000);

    var heightOffset = 32;
    for (var i = 1; i <= 4; ++i) {
      var yPos = heightOffset + heightOffset * (i - 1);
      this['playerLabel' + i] = this.add.text(10, yPos, ``, config).setDepth(1000);
    }

    this.fireLabel = this.add.text(10, this.cameras.main.height - 64, '', config).setDepth(1000);
    this.fireMsg = "Press left mouse to fire!";
    this.reloadingMsg = "Reloading... ";

    this.game = this.scene.get('GameScene');
  }

  update(time, delta) {
    if (this.game.lastStateUpdate) {
      var currentTime = this.game.lastStateUpdate.currentTime;
      var timeLimit = this.game.lastStateUpdate.timeLimit;

      this.timerLabel.setText(`Time Remaining: ${Math.floor(timeLimit - currentTime)}`);

      var i = 1;

      for (var key in this.game.lastStateUpdate.players) {
        var value = this.game.lastStateUpdate.players[key];

        this['playerLabel' + i].setText(`${value.name}: ${value.kills}`);

        ++i;
      }

      if(this.game.tank) {
        if(this.game.tank.canFire) {
          this.fireLabel.setText(this.fireMsg);
        } else {
          this.fireLabel.setText(this.reloadingMsg + this.game.tank.cooldown.toFixed(2));
        }
      }
    }
  }
}

class GameScene extends Phaser.Scene {

  constructor() {
    super('GameScene');

    this.mouseWheel = 0;
    this.currentPlayers = 1;

    this.gameActions = {
      UP: 'up',
      LEFT: 'left',
      RIGHT: 'right',
      DOWN: 'down',
      TILT_LEFT: 'tilt_left',
      TILT_RIGHT: 'tilt_right',
      FIRE: 'fire',
    };

    this.playerData = {
      actions: [],
      gunRotation: 0
    };
  }

  init(data) {
    this.socket = data.socket;
    this.uniqueID = data.uniqueID;
  }

  create() {

    var self = this;

    this.cloudsFar = this.add.tileSprite(3850 / 2, 200, 3850, 400, 'cloudsFar').setScrollFactor(0.1);
    this.cloudsMid = this.add.tileSprite(3850 / 2, 350, 3850, 400, 'cloudsMid').setScrollFactor(0.2);
    this.cloudsNear = this.add.tileSprite(3850 / 2, 500, 3850, 400, 'cloudsNear').setScrollFactor(0.3);
    this.landFar = this.add.tileSprite(3850 / 2, 650, 3850, 400, 'landFar').setScrollFactor(0.4);
    this.landMid = this.add.tileSprite(3850 / 2, 800, 3850, 400, 'landMid').setScrollFactor(0.5);
    this.landNear = this.add.tileSprite(3850 / 2, 850, 3850, 400, 'landNear').setScrollFactor(0.6);
    this.groundNear = this.add.tileSprite(3850 / 2, 1000, 3850, 400, 'groundNear').setScrollFactor(0.7);
    this.water = this.add.tileSprite(3850 / 2, 2170 / 2, 3850, 2172, 'water');

    this.flashCount = 0;
    this.explosionCount = 0;
    //this.masks = this.make.graphics({ fillStyle: { color: 0xffffff }, add: false })
    this.masks = this.add.graphics({x:0, y:0});
    this.masks.visible = false;
    this.levelBG = self.add.image(3850 / 2, 2170 / 2, 'levelBG');
    this.level = self.add.image(3850 / 2, 2170 / 2, 'level');
    var mask = new Phaser.Display.Masks.GeometryMask(this, this.masks);
    mask.invertAlpha = true;
    this.level.setMask(mask);

    ClipperLib.Clipper.StrictlySimple = true;
    this.levelGeometry = [[]];
    var src = this.textures.get('level').getSourceImage();
    var canvas = this.textures.createCanvas('march', src.width, src.height).draw(0, 0, src);
    var outline = MarchingSquaresOpt.getBlobOutlinePoints(canvas.data, canvas.width, canvas.height);
    this.textures.remove('march');
    for (let i = 0; i < outline.length; i += WORLD_SCALE) {
      this.levelGeometry[0].push({ X: outline[i], Y: outline[i + 1] });
    }

    self.graphics = self.add.graphics({ lineStyle: { width: 4, color: 0xaa6622 } });
    //drawGeometry(self);
    //self.graphics.fillRect(0,0,3850, 2170);

    //generateLevelGeometry(self);

    if (document.body.addEventListener) {
      // IE9, Chrome, Safari, Opera
      document.body.addEventListener("mousewheel", this.mouseWheelHandler, false);
      // Firefox
      document.body.addEventListener("DOMMouseScroll", this.mouseWheelHandler, false);
    }

    this.currentZoom = 100;

    this.otherPlayers = {};
    this.lastStateUpdate = {};
    this.bullets = [];
    this.input.setPollAlways();
    this.explosionsPending = [];
    this.fireButtonPressed = false;

    this.socket.emit('playerName', PLAYER_NAME);

    this.input.on('pointerdown', function (pointer) {
      self.playerData.actions.push(this.gameActions.FIRE);
      self.fireButtonPressed = true;
    }, this);

    this.socket.on('explosions', function (explosions) {
      for (let i = 0; i < explosions.length; i++) {
        const explosion = explosions[i];
        self.explosionsPending.push(explosion);
      }
    })

    this.socket.on('serverUpdate', function (state) {
      self.lastStateUpdate = state;
    });

    this.socket.on('player_events', function (player_events) {
      for (var key in player_events) {
        var values = player_events[key];
        if (key === self.uniqueID) {
          self.events.push(...values);
        }
        else {
          self.otherPlayers[key].events.push(...values);
        }
      }
    });

    this.socket.on('currentPlayers', function (players) {
      Object.keys(players).forEach(function (id) {
        if (players[id].playerId === self.uniqueID) {
          self.addPlayer(self, players[id]);
        } else {
          self.addOtherPlayers(self, players[id]);
        }
      });
    });

    this.socket.on('gameFinished', function (data) {	
      self.currentPlayers = 1; // reset this for the next time around 
      self.socket.disconnect();	
      self.sound.stopAll();
      self.scene.stop('HUD');	
      self.scene.start('MenuBG');	
      self.scene.start('PostGame', data);	
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

    this.particleShapes = this.add.particles('shapes');

    this.addBullets(self);

    this.socket.emit('confirmReady');

    //Audio
    this.music = this.sound.add('bg-music', { volume: 0.35, loop: true });
    this.music.play();
    this.bgLoop = this.sound.add('bg-loop', { volume: 0.6, loop: true });
    this.bgLoop.play();
    this.explosionSound = this.sound.add('explosion', { volume: 0.7 });
  }

  createPlayerSounds() {
    var playerSounds = {};
    playerSounds.engineLoop = this.sound.add('engine-loop', { volume: 0.2, loop: true, detune: Phaser.Math.Between(-100, 100) });
    playerSounds.fire = this.sound.add('tank-fire', { volume: 0.4 });
    playerSounds.gunClick = this.sound.add('gun-click', { volume: 0.2 });
    playerSounds.rocketLoop = this.sound.add('rocket-loop', { volume: 0.16, loop: true, detune: Phaser.Math.Between(-100, 100) });
    playerSounds.bubbleLoop = this.sound.add('bubble-loop', { volume: 0.03, loop: true, detune: Phaser.Math.Between(-100, 100) });
    return playerSounds;
  }

  createBubbleEmitter(player) {
    player.bubblesEmitter = this.particleShapes.createEmitter(new Function('return ' + this.cache.text.get('tank_particle'))());
    player.bubblesEmitter.startFollow(player);
    player.bubblesEmitter.active = true;
    player.bubblesEmitter.on = false;
  }

  addPlayer(self, playerInfo) {

    var turret = self.add.image(0, TURRET_HEIGHT_OFFSET, 'tankGun' + self.currentPlayers).setOrigin(0.04, 0.5);
    var treads = self.add.image(0, TREAD_HEIGHT_OFFSET, 'treads' + self.currentPlayers).setOrigin(0.5, 0.5);
    var armor = self.add.image(0, 0, 'tank' + self.currentPlayers).setOrigin(0.5, 0.5);

    var healthGraphics = this.add.graphics();
    var healthBar = new Phaser.Geom.Rectangle();
    healthBar.width = HEALTH_BAR_WIDTH;
    healthBar.height = 10;

    self.explodeConfig = {
      key: 'flashAnimation',
      frames: self.anims.generateFrameNumbers('flash'),
      frameRate: 24
    };

    self.anims.create(self.explodeConfig);

    var flash = self.add.sprite(0, TURRET_HEIGHT_OFFSET, 'flash').setOrigin(0.0, 0.5);

    self.tank = self.add.container(playerInfo.x, playerInfo.y, [turret, treads, armor, flash]);

    self.tank.label = self.add.text(0, 0, playerInfo.name, { font: '32px Monospace', fill: '#ffffff', align: 'center' }).setOrigin(0.5, 0.5);

    self.tank.flash = flash;
    self.tank.armor = armor;
    self.tank.turret = turret;
    self.tank.treads = treads;
    self.tank.healthGraphics = healthGraphics;
    self.tank.healthBar = healthBar;
    self.events = [];
    self.tank.health = 100;
    self.tank.cooldown = 1.6;
    self.tank.canFire = true;

    self.tank.setSize(90, 50);
    self.tank.setDepth(1);
    self.physics.world.enable(self.tank);

    self.cameras.main.startFollow(self.tank, true, 0.2, 0.2);

    self.playerSounds = self.createPlayerSounds();
    self.playerSounds.engineLoop.play();
    this.createBubbleEmitter(self.tank);
    self.currentPlayers++;
  }

  addOtherPlayers(self, playerInfo) {

    var turret = self.add.image(0, TURRET_HEIGHT_OFFSET, 'tankGun' + self.currentPlayers).setOrigin(0.04, 0.5);
    var treads = self.add.image(0, 24, 'treads' + self.currentPlayers).setOrigin(0.5, 0.5);
    var armor = self.add.image(0, 0, 'tank' + self.currentPlayers).setOrigin(0.5, 0.5);

    var healthGraphics = this.add.graphics();
    var healthBar = new Phaser.Geom.Rectangle();
    healthBar.width = HEALTH_BAR_WIDTH;
    healthBar.height = 10;

    self.explodeConfig = {
      key: 'flashAnimation',
      frames: self.anims.generateFrameNumbers('flash'),
      frameRate: 24
    };

    self.anims.create(self.explodeConfig);

    var flash = self.add.sprite(0, TURRET_HEIGHT_OFFSET, 'flash').setOrigin(0.0, 0.5);

    var otherPlayer = self.add.container(playerInfo.x, playerInfo.y, [turret, treads, armor, flash]);
    otherPlayer.label = self.add.text(0, 0, playerInfo.name, { font: '32px Monospace', fill: '#ffffff', align: 'center' }).setOrigin(0.5, 0.5);
    otherPlayer.name = playerInfo.name;
    otherPlayer.flash = flash;
    otherPlayer.armor = armor;
    otherPlayer.turret = turret;
    otherPlayer.treads = treads;
    otherPlayer.healthGraphics = healthGraphics;
    otherPlayer.healthBar = healthBar;
    otherPlayer.events = [];
    otherPlayer.health = 100;

    otherPlayer.setSize(90, 50);
    otherPlayer.isBoosting = false;
    otherPlayer.hasFired = false;
    otherPlayer.playerSounds = this.createPlayerSounds();
    otherPlayer.playerSounds.engineLoop.play();
    //otherPlayer.playerId = playerInfo.playerId;
    self.otherPlayers[playerInfo.playerId] = otherPlayer;
    this.createBubbleEmitter(otherPlayer);
    otherPlayer.setDepth(1);
    self.currentPlayers++;
  }

  addBullets(self) {

    for (var i = 0; i < MAX_BULLET_COUNT; ++i) {
      var bullet = self.add.image(0, 0, 'bullet').setOrigin(0.5, 0.5);
      bullet.rotation = 0;
      var newBullet = self.add.container(0, 0, [bullet]);
      newBullet.bullet = bullet;
      newBullet.setSize(50, 50);
      newBullet.emitter = self.particleShapes.createEmitter(new Function('return ' + self.cache.text.get('particle-effect'))());
      newBullet.emitter.startFollow(newBullet);
      newBullet.emitter.active = true;
      newBullet.emitter.on = false;
      self.bullets.push(newBullet);
    }
  }

  mouseWheelHandler(e) {

    // cross-browser wheel delta
    var e = window.event || e; // old IE support
    this.mouseWheel = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  }

  generateLevelGeometry(self) {

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

  damageLevelGeometry(self, damagePath) {
    var cpr = new ClipperLib.Clipper();
    cpr.AddPaths(self.levelGeometry, ClipperLib.PolyType.ptSubject, true);
    cpr.AddPaths(damagePath, ClipperLib.PolyType.ptClip, true);
    var newGeometry = new ClipperLib.Paths();
    var succeeded = cpr.Execute(ClipperLib.ClipType.ctDifference, newGeometry, ClipperLib.PolyFillType.pftEvenOdd, ClipperLib.PolyFillType.pftEvenOdd);
    newGeometry = ClipperLib.Clipper.CleanPolygons(newGeometry, 0.1);
    self.levelGeometry = ClipperLib.Clipper.SimplifyPolygons(newGeometry, ClipperLib.PolyFillType.pftNonZero);
    //drawGeometry(self);
  }

  drawGeometry(self) {
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

  updateExplosions(self) {

    self.explosionsPending.forEach(function (explosion) {
      var circle = [];

      var step = 2 * Math.PI / 20;  // see note 1

      var h = explosion.worldX * WORLD_SCALE;
      var k = explosion.worldY * WORLD_SCALE;
      var r = BLAST_RADIUS;

      var circleMask = new Phaser.Geom.Circle(h, k, r);
      self.masks.fillStyle(0, 1.0);
      self.masks.fillCircleShape(circleMask);

      for (var theta = 0; theta < 2 * Math.PI; theta += step) {
        circle.push({ X: h + r * Math.cos(theta), Y: k - r * Math.sin(theta) });
      }

      var geometry = [];
      geometry.push(circle);

      self.damageLevelGeometry(self, geometry);
      var distance = Phaser.Math.Distance.Between(self.tank.x, self.tank.y, h, k);
      distance = Phaser.Math.Clamp(distance, 0, 3000);
      self.explosionSound.play({ volume: (1 - distance / 3000) * 0.7, detune: Phaser.Math.Between(-100, 100) });

      var explodeConfig = {
        key: 'explode' + self.explosionCount,
        frames: self.anims.generateFrameNumbers('boom', { start: 0, end: 4, first: 4 }),
        frameRate: 24
      };

      self.anims.create(explodeConfig);

      var boom = self.add.sprite(h, k, 'boom');
      boom.explodey = self.particleShapes.createEmitter(new Function('return ' + self.cache.text.get('explosion'))());
      boom.explodey.startFollow(boom);

      boom.anims.play('explode' + self.explosionCount);

      boom.once('animationcomplete', () => {
        boom.explodey.on = false;
        boom.destroy()
      });

      self.cameras.main.shake(333, 0.025, true);
    });

    self.explosionCount++;

    self.explosionsPending = [];
  }

  updateAudio() {
    //Update main player audio
    if (this.keys.up.isDown || this.keys.left.isDown || this.keys.right.isDown || this.keys.right.isDown || this.keys.tiltLeft.isDown || this.keys.tiltRight.isDown) {
      if (!this.playerSounds.rocketLoop.isPlaying) this.playerSounds.rocketLoop.play();
      if (!this.playerSounds.bubbleLoop.isPlaying) this.playerSounds.bubbleLoop.play();

    }
    else {
      this.playerSounds.rocketLoop.stop();
      this.playerSounds.bubbleLoop.stop();
    }

    if (this.hasFired) {
      this.playerSounds.fire.play();
      this.hasFired = false;
    }
    else if (this.fireFailed) {
      this.playerSounds.gunClick.play();
      this.fireFailed = false;
    }

    //Update other players
    for (var key in this.otherPlayers) {
      var otherPlayer = this.otherPlayers[key];

      var distance = Phaser.Math.Distance.Between(this.tank.x, this.tank.y, otherPlayer.x, otherPlayer.y);
      distance = Phaser.Math.Clamp(distance, 0, 2000);
      var vol = (1 - distance / 2000);
      otherPlayer.playerSounds.engineLoop.setVolume(vol * 0.2);
      if (otherPlayer.isBoosting) {
        if (!otherPlayer.playerSounds.rocketLoop.isPlaying) otherPlayer.playerSounds.rocketLoop.play({ volume: vol * 0.16 });
        if (!otherPlayer.playerSounds.bubbleLoop.isPlaying) otherPlayer.playerSounds.bubbleLoop.play({ volume: vol * 0.03 });

      }
      else {
        otherPlayer.playerSounds.rocketLoop.stop();
        otherPlayer.playerSounds.bubbleLoop.stop();
      }
      if (otherPlayer.hasFired) {
        otherPlayer.playerSounds.fire.play({ volume: vol * 0.4 });
        otherPlayer.hasFired = false;
      }
      else if (otherPlayer.fireFailed) {
        otherPlayer.playerSounds.gunClick.play({ volume: vol * 0.5 });
        otherPlayer.fireFailed = false;
      }
    }
  }

  drawHealthBar(tank) {
    tank.healthGraphics.clear();

    var healthRatio = tank.health / MAX_HEALTH;
   
    tank.label.x = tank.x;
    tank.label.y = tank.y - 75;

    tank.healthBar.x = tank.x - HEALTH_BAR_WIDTH / 2;
    tank.healthBar.y = tank.y - 55;

    tank.healthBar.width = HEALTH_BAR_WIDTH;
    tank.healthBar.height = HEALTH_BAR_HEIGHT;
    tank.healthGraphics.fillStyle(HEALTH_BAR_BG);
    tank.healthGraphics.fillRectShape(tank.healthBar);

    tank.healthBar.width = HEALTH_BAR_WIDTH * healthRatio;
    tank.healthBar.height = HEALTH_BAR_HEIGHT;
    tank.healthGraphics.fillStyle(HEALTH_BAR_FG);
    tank.healthGraphics.fillRectShape(tank.healthBar);

    tank.healthBar.width = HEALTH_BAR_WIDTH;
    tank.healthGraphics.lineStyle(2, BLACK);
    tank.healthGraphics.strokeRectShape(tank.healthBar);
    tank.healthGraphics.visible = tank.visible;
  }

  rotate2DVector(vector, rotation) {
    var cosA = Math.cos(rotation);
    var sinA = Math.sin(rotation);
    var x = vector.x;
    var y = vector.y;
    vector.x = cosA * x - sinA * y;
    vector.y = sinA * x + cosA * y;
    return vector;
  }

  update(time, delta) {

    this.water.tilePositionX += 0.7;
    this.cloudsFar.tilePositionX += 0.1;
    this.cloudsMid.tilePositionX += 0.3;
    this.cloudsNear.tilePositionX += 0.5;

    this.updateExplosions(this);

    if (this.tank) {

      for (var key in this.lastStateUpdate.players) {
        var value = this.lastStateUpdate.players[key];

        if (key === this.uniqueID) {
          this.tank.setPosition(value.x * WORLD_SCALE, value.y * WORLD_SCALE);
          this.tank.turret.rotation = value.gunRotation;
          this.tank.rotation = value.rotation;
          this.tank.canFire = value.canFire;
          this.tank.cooldown = value.cooldown;

          if (value.health != this.tank.health) {
            this.cameras.main.flash(333, 255, 0, 0, true);
          }
      
          this.tank.health = value.health;
          this.tank.bubblesEmitter.on = false;
          this.events.forEach(e => {
            switch (e) {
              case PlayerEvents.KILLED:
                break;
              case PlayerEvents.EXPLODED:
                this.tank.visible = false;
                this.tank.label.visible = false;
                break;
              case PlayerEvents.SPAWNED:
                this.tank.visible = true;
                this.tank.label.visible = true;
                break;
              case PlayerEvents.FIRED:
                this.hasFired = true;
                break;
              case PlayerEvents.FIRE_FAILED:
                this.fireFailed = true;
                break;
              case PlayerEvents.BOOST_LEFT:
              case PlayerEvents.BOOST_RIGHT:
              case PlayerEvents.BOOST_UP:
                this.tank.bubblesEmitter.on = true;     
                break;
              
            }
          });
          this.events = [];
          this.drawHealthBar(this.tank);
          this.tank.flash.rotation = value.gunRotation;

          if (this.hasFired) {
            this.tank.flash.anims.play('flashAnimation');
          }
        }

        else if (this.otherPlayers[key]) {
          this.otherPlayers[key].setPosition(value.x * WORLD_SCALE, value.y * WORLD_SCALE);
          this.otherPlayers[key].rotation = value.rotation;
          this.otherPlayers[key].turret.rotation = value.gunRotation;
          this.otherPlayers[key].isBoosting = value.isBoosting;
          this.otherPlayers[key].bubblesEmitter.on = false;

          this.otherPlayers[key].events.forEach(e => {
            switch (e) {
              case PlayerEvents.KILLED:
                break;
              case PlayerEvents.EXPLODED:
                this.otherPlayers[key].visible = false;
                this.otherPlayers[key].label.visible = false;
                break;
              case PlayerEvents.SPAWNED:
                this.otherPlayers[key].visible = true;
                this.otherPlayers[key].label.visible = true;
                break;
              case PlayerEvents.FIRED:
                this.otherPlayers[key].hasFired = true;
                break;
              case PlayerEvents.FIRE_FAILED:
                this.otherPlayers[key].fireFailed = true;
                break;
              case PlayerEvents.BOOST_LEFT:
              case PlayerEvents.BOOST_RIGHT:
              case PlayerEvents.BOOST_UP:
                this.otherPlayers[key].bubblesEmitter.on = true;
                break;
            }
          });
          this.otherPlayers[key].events = [];
          this.otherPlayers[key].health = value.health;

          this.drawHealthBar(this.otherPlayers[key]);
          this.otherPlayers[key].flash.rotation = value.gunRotation;

          if (this.otherPlayers[key].hasFired) {
            this.otherPlayers[key].flash.anims.play('flashAnimation');
          }
        }
      }

      var activeBulletCount = 0;

      if (this.lastStateUpdate.bullets) {

        var activeBulletCount = Phaser.Math.Clamp(this.lastStateUpdate.bullets.length, 0, MAX_BULLET_COUNT);

        for (var i = 0; i < activeBulletCount; i++) {
          var x = this.lastStateUpdate.bullets[i].x * WORLD_SCALE;
          var y = this.lastStateUpdate.bullets[i].y * WORLD_SCALE;
          this.bullets[i].visible = true;
          this.bullets[i].rotation = this.lastStateUpdate.bullets[i].rotation;
          this.bullets[i].x = x;
          this.bullets[i].y = y;
          this.bullets[i].emitter.on = true;
        }
      }

      var leftOverBullets = this.bullets.length - activeBulletCount;
      for (var i = activeBulletCount; i < leftOverBullets; i++) {
        this.bullets[i].visible = false;
        this.bullets[i].emitter.on = false;
      }

      this.updateAudio();
      var mouseX = game.input.activePointer.x;
      var mouseY = game.input.activePointer.y;

      var vec = this.cameras.main.getWorldPoint(mouseX, mouseY);

      // calculate gun direction in local space

      this.playerData.gunRotation = Phaser.Math.Angle.Between(this.tank.x, this.tank.y, vec.x, vec.y - TURRET_HEIGHT_OFFSET);

      // apply a 90 degree offset so that the 0 to 360 degree wrap is at the bottom of the tank
      // this will allow us to clamp the valid firing directions using all directions above the tank, preventing downwards fire
      var offset = Math.PI / 2;
      this.playerData.gunRotation -= offset;
      this.playerData.gunRotation -= this.tank.rotation;
      this.playerData.gunRotation = Phaser.Math.Angle.Normalize(this.playerData.gunRotation);
      this.playerData.gunRotation = Phaser.Math.Clamp(this.playerData.gunRotation, 1.3, 5.0); // only allow firing between these angles
      // remove the offset to return to our normal rotation
      this.playerData.gunRotation += offset;

      if (this.keys.left.isDown) {
        this.playerData.actions.push(this.gameActions.LEFT);
      } if (this.keys.right.isDown) {
        this.playerData.actions.push(this.gameActions.RIGHT);
      } if (this.keys.up.isDown) {
        this.playerData.actions.push(this.gameActions.UP);
      } if (this.keys.down.isDown) {
        this.playerData.actions.push(this.gameActions.DOWN);
      } if (this.keys.tiltLeft.isDown) {
        this.playerData.actions.push(this.gameActions.TILT_LEFT);
      } if (this.keys.tiltRight.isDown) {
        this.playerData.actions.push(this.gameActions.TILT_RIGHT);
      }

      //Send player actions to the server
      this.socket.emit('playerUpdate', this.playerData);

      this.playerData.actions = [];
    }

    this.currentZoom += (this.mouseWheel * ((delta / 1000) * 0.33333));

    this.currentZoom = Phaser.Math.Clamp(this.currentZoom, 0.333333, 1);

    this.cameras.main.zoom = this.currentZoom;

    // reset mouse

    this.mouseWheel = 0;
  }
}

class PostGame extends Phaser.Scene {
  constructor() {
    super('PostGame');
  }

  preload() {
  }

  init(scores) {
    this.scores = scores;
    this.scores.sort(function (a, b) { return b.score - a.score });
    this.isADraw = scores[0].score === scores[1].score;
  }

  create() {
    var self = this;

    this.back = this.add.image(self.cameras.main.centerX, self.cameras.main.height / 1.15, 'back')
      .setInteractive()
      .on('pointerdown', function () {
        
        self.scene.start('MainMenu');
      });


    if(!this.isADraw) {
      this.logo = this.add.image(self.cameras.main.centerX, self.cameras.main.centerY, 'victory');
      this.winner = this.add.text(self.cameras.main.centerX, self.cameras.main.centerY * 0.6333, `${this.scores[0].name} is the winner!`, { font: '64px Monospace', fill: '#ffffff', align: 'center' });
      this.winner.setOrigin(0.5, 0.5);
    } else {
      this.logo = this.add.image(self.cameras.main.centerX, self.cameras.main.centerY, 'draw');
      this.winner = this.add.text(self.cameras.main.centerX, self.cameras.main.centerY * 0.6333, "It's a draw!", { font: '64px Courier', fill: '#ffffff', align: 'center' });
      this.winner.setOrigin(0.5, 0.5);
    }

    for (var i = 0; i < this.scores.length; ++i) {
      var score = this.scores[i];
      var entry = self.add.text(self.cameras.main.centerX, self.cameras.main.centerY * 0.8333 + (i * 42), `${score.name}: ${score.score}`, { font: '48px Monospace', fill: '#ffffff', align: 'center' });
      entry.setOrigin(0.5, 0.5);
    }
  }

  pulse(time, bias) {
    var scale = Math.sin(time / 2000.0);
    scale += bias;
    scale /= bias + 1;
    return scale;
  }

  update(time, delta) {

    var logoScale = this.pulse(time, 10);
    this.logo.scaleX = logoScale;
    this.logo.scaleY = logoScale;

    var buttonScale = this.pulse(time, 15);
    this.back.scaleX = buttonScale;
    this.back.scaleY = buttonScale;
  }
}

var config = {
  type: Phaser.WEBGL,
  width: 1920,
  height: 1080,
  scale:{
    mode: Phaser.Scale.ScaleModes.FIT,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH
  },
  backgroundColor: '#0055aa',
  parent: 'phaser-example',
  scene: [Bootstrap, MenuBG, ClickToStart, NameEntry, MainMenu, HighScores, GameLoad, GameScene, PostGame, HUD],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  }
};

var game = new Phaser.Game(config);


