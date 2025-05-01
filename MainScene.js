// MainScene.js
import { objectConfigs, weightedPick } from './objectConfigs.js';
import { addTouchControlGrid } from './TouchControls.js';
import { highScoreManager } from './game.js';
import { isMobile, createButton } from './helpers.js';

function textStyle() {
    return {
      fontSize: '12px',
      fill: '#020202',
      fontFamily: '"Press Start 2P"'
    };
  }

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('stars', 'assets/stars.png');
    //this.load.sound('pickup', 'assets/pickup.wav');
    objectConfigs.forEach(o => this.load.image(o.sprite, `assets/${o.sprite}.png`));
  }

  create(data = {}) {
    this.ready = false;
    this.score = 0;
    this.distance = 0;
    this.scrollSpeedY = 2;
    this.lateralSpeed = 0;
    this.touchDirection = 0; // -1 for left, 0 for straight, 1 for right
    this.touchSpeedChange = 0; // -1 for slower, 0 for same, 1 for faster   
    this.collisionDisabled = false;
    this.gamePaused = false;
    this.gameOver = false;
    this.minSpeed = 2;
    this.maxSpeed = 10;
    this.elapsedTimeMs = 0;
    this.remainingTimeMs = 30 * 1000;
    this.spawnAccumulator = 0;
    this.spawnPadding = 10;
    const referenceWidth = 680; // original width
    const widthScaleFactor = this.scale.width / referenceWidth;

    const difficultyMap = {
      Easy:    { obstacle: 0.05, collectible: 0.05 },
      Normal:  { obstacle: 0.07, collectible: 0.05 },
      Hard:    { obstacle: 0.10, collectible: 0.04 },
      Insane:  { obstacle: 0.15, collectible: 0.03 }
    };

    // Spawn settings
    const difficulty = data.difficulty || 'Normal';
    const settings = difficultyMap[difficulty];
    this.obstacleSpawnChance = settings.obstacle;
    this.collectibleSpawnChance = settings.collectible;
    this.adjustedObstacleChance = this.obstacleSpawnChance * widthScaleFactor;
    this.adjustedCollectibleChance = this.collectibleSpawnChance * widthScaleFactor;

    // Load skier sprites
    let skierBase = 'skiers/skier'; // fallback
    try {
      const saved = JSON.parse(localStorage.getItem('selectedSkier'));
      if (saved?.base) skierBase = saved.base;
    } catch (e) {
      console.warn('⚠️ Could not parse saved skier');
    }
  
    const loader = this.load;
    loader.image('skier', `assets/${skierBase}.png`);
    loader.image('skier_left', `assets/${skierBase}_left.png`);
    loader.image('skier_right', `assets/${skierBase}_right.png`);
    loader.image('skier_crash', `assets/${skierBase}_crash.png`);

    // Load sounds
    this.load.audio('pickup', 'assets/pickup.wav');

    // Load game music
    const saved = JSON.parse(localStorage.getItem('selectedSong'));
    const musicFile = saved?.file || 'ski_patrol_theme.mp3';
    const musicKey = musicFile.replace('.mp3', '');
    
    this.musicKey = musicKey; // spara för senare
    
    this.load.audio(musicKey, `assets/${musicFile}`);
    
    // När laddning är klar, kör initGame
    this.load.once('complete', () => {
      this.initGame();
    });
    this.load.start();
}

initGame() {
    // Stop any music already playing, then start game music
    const startMusic = this.sound.get('music_start');
    if (startMusic && startMusic.isPlaying) {
      startMusic.stop();
    }


    const saved = JSON.parse(localStorage.getItem('selectedSong'));
    const musicKey = saved?.file?.replace('.mp3', '') || 'music_game';
    if (this.sound.get(musicKey)) {
      this.sound.get(musicKey).stop();
    }
    this.music = this.sound.add(musicKey, { loop: true, volume: 0.5 });
    this.music.play();

    this.pickupSound = this.sound.add('pickup');

    this.obstacles = this.add.group();
    this.collectibles = this.add.group();
    this.debugGraphics = this.add.graphics();

    this.player = this.add.sprite(this.scale.width / 2, 200, 'skier').setScale(0.1).setDepth(500);
    this.crashSkier = this.add.sprite(this.player.x, this.player.y, 'skier_crash').setScale(0.1).setVisible(false).setDepth(500);
    this.stars = this.add.sprite(this.player.x, this.player.y - 20, 'stars').setScale(0.08).setVisible(false).setDepth(501);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.timeText = this.add.text(20, 100, 'Time: 60.0s', this.textStyle()).setDepth(1000);
    this.scoreText = this.add.text(20, 120, 'Pickups: 0', this.textStyle()).setDepth(1000);
    this.distanceText = this.add.text(20, 140, 'Distance: 0', this.textStyle()).setDepth(1000);

    if (this.sys.game.device.os.android || this.sys.game.device.os.iOS) {
        addTouchControlGrid(this, {
          columns: [0.3, 0.4, 0.3],
          rows: [0.3, 0.4, 0.3],
          controlHeightPercent: 0.4,
          controlWidthPercent:0.8,
          verticalOffset: 30,
          alpha: 0.10
        });
    }
    this.ready = true;
}

update(time, delta) {
    if (!this.ready) return; 
    if (this.gameOver) return;
  
    // Skip keyboard input if touch input was detected
    const usingTouch = this.sys.game.device.input.touch;
  
    if (!this.gamePaused) {
      if (!usingTouch) {
        this.lateralSpeed = 0;
  
        if (this.cursors.left.isDown) {
          this.player.setTexture('skier_left');
          this.lateralSpeed = 1.5;
        } else if (this.cursors.right.isDown) {
          this.player.setTexture('skier_right');
          this.lateralSpeed = -1.5;
        } else {
          this.player.setTexture('skier');
        }
  
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
          this.scrollSpeedY = Math.max(this.minSpeed, this.scrollSpeedY - 1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
          this.scrollSpeedY = Math.min(this.maxSpeed, this.scrollSpeedY + 1);
        }
      } else {
        // Touch mode: just switch texture based on current lateralSpeed
        if (this.lateralSpeed > 0) {
          this.player.setTexture('skier_left');
        } else if (this.lateralSpeed < 0) {
          this.player.setTexture('skier_right');
        } else {
          this.player.setTexture('skier');
        }
      }
    }
  
    this.moveObjects();
    this.updateDistance();
    this.updateTime(delta);
    this.checkForCollisions();
  
    if (this.stars.visible) {
      this.stars.rotation += 0.1;
    }
  }
  

  moveObjects() {
    [...this.obstacles.getChildren(), ...this.collectibles.getChildren()].forEach(obj => {
      obj.y -= this.scrollSpeedY;
      obj.x += this.lateralSpeed;
      obj.setDepth(obj.y > this.player.y ? 600 : 400);
      if (obj.y < -50) obj.destroy();
    });
  }

  updateDistance() {
    if (!this.gamePaused) {
      this.distance += this.scrollSpeedY;
      this.distanceText.setText('Distance: ' + Math.round(this.distance / 20) + ' m');
      this.spawnAccumulator += this.scrollSpeedY;
      this.spawnObjectsContinuously();
    }
  }

  spawnObjectsContinuously() {
    const obstacleDefs = objectConfigs.filter(o => o.type === 'obstacle');
    const collectibleDefs = objectConfigs.filter(o => o.type === 'collectible');
  
    const spawnInterval = 5;
    while (this.spawnAccumulator >= spawnInterval) {
      this.spawnAccumulator -= spawnInterval;
  
      if (Phaser.Math.FloatBetween(0, 1) < this.adjustedObstacleChance) {
        const def = weightedPick(obstacleDefs);
        const conf = def.config();
        conf.height = Phaser.Math.Between(this.scale.height + 50, this.scale.height + 150);
        this.createObstacle(conf);
      }
  
      if (Phaser.Math.FloatBetween(0, 1) < this.adjustedCollectibleChance) {
        const def = weightedPick(collectibleDefs);
        const conf = def.config();
        conf.height = Phaser.Math.Between(this.scale.height + 50, this.scale.height + 150);
        this.createCollectible(conf);
      }
    }
  }

  updateTime(delta) {
    this.elapsedTimeMs += delta;
    this.remainingTimeMs -= delta;

    let timeLeft = Math.max(0, this.remainingTimeMs / 1000);
    this.timeText.setText('Time: ' + timeLeft.toFixed(1) + 's');

    if (this.remainingTimeMs <= 0 && !this.gameOver) {
      this.gameOver = true;
      this.endGame();
    }
  }

  checkForCollisions() {
    const skierBounds = new Phaser.Geom.Rectangle(
      this.player.x - this.player.displayWidth * 0.15,
      this.player.y - this.player.displayHeight * 0.1,
      this.player.displayWidth * 0.3,
      this.player.displayHeight * 0.3
    );

    this.obstacles.getChildren().forEach(obj => {
      const box = obj.customHitbox;
      const bounds = new Phaser.Geom.Rectangle(
        obj.x - obj.displayWidth / 2 + obj.displayWidth * box.x,
        obj.y - obj.displayHeight / 2 + obj.displayHeight * box.y,
        obj.displayWidth * box.width,
        obj.displayHeight * box.height
      );

      if (!this.collisionDisabled && !this.gamePaused && Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, bounds)) {
        //this.debugGraphics.lineStyle(2, 0x00ff00); // green
        //this.debugGraphics.strokeRect(skierBounds.x, skierBounds.y, skierBounds.width, skierBounds.height);
        //this.debugGraphics.lineStyle(2, 0xff0000); // red
        //this.debugGraphics.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        this.triggerPause();
      }
    });

    this.collectibles.getChildren().forEach(obj => {
      const box = obj.customHitbox;
      const bounds = new Phaser.Geom.Rectangle(
        obj.x - obj.displayWidth * box.x,
        obj.y - obj.displayHeight / 2 + obj.displayHeight * box.y,
        obj.displayWidth * box.width,
        obj.displayHeight * box.height
      );

      if (!this.gamePaused && Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, bounds)) {
        this.score += obj.points || 0;
        this.scoreText.setText('Pickups: ' + this.score);
        this.pickupSound.play({ volume: 1 });

        if (obj.timeBonus) {
          this.remainingTimeMs += obj.timeBonus;
          this.timeText.setColor('#E34234');
          this.time.delayedCall(500, () => {
            this.timeText.setColor('#020202');
          });
        }
        obj.destroy();
      }
    });
  }

  triggerPause() {
    this.gamePaused = true;
    this.collisionDisabled = false;
    this.scrollSpeedY = 0;
    this.lateralSpeed = 0;

    this.stars.setVisible(true);
    this.crashSkier.setVisible(true);
    this.crashSkier.setPosition(this.player.x, this.player.y);
    this.stars.setPosition(this.player.x, this.player.y - 20);
    this.player.setVisible(false);

    setTimeout(() => {
      this.debugGraphics.clear();
      this.gamePaused = false;
      this.scrollSpeedY = 2;
      this.collisionDisabled = true;
      this.stars.setVisible(false);
      this.crashSkier.setVisible(false);
      this.player.setVisible(true);
      this.blinkTimer = this.time.addEvent({
        delay: 200,
        loop: true,
        callback: () => {
          this.player.visible = !this.player.visible;
        }
      });
    }, 2000);

    setTimeout(() => {
      this.collisionDisabled = false;
      if (this.blinkTimer) {
        this.blinkTimer.remove(false);
        this.blinkTimer = null;
      }
      this.player.setVisible(true);
    }, 5000);
  }

  async endGame() {
    this.gameOver = true;
    this.scrollSpeedY = 0;
    this.lateralSpeed = 0;
  
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
  
    // Ta bort spelknappar på mobil
    if (this.touchControls) {
      this.touchControls.clear(true, true); // Destroy alla kontroller + events
      this.touchControls = null;            // Ta bort referensen
    }

    // Bakgrund
    this.add.rectangle(centerX, centerY, this.scale.width, this.scale.height, 0x000000, 0.7)
      .setOrigin(0.5)
      .setDepth(999);
  
    // Game Over text
    this.add.text(centerX, centerY - 80, 'GAME OVER', {
      fontSize: '32px', fill: '#E34234', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1001);
  
    // 🔎 Kolla om något rekord slagits
    const categories = [
      { key: 'distance', value: Math.round(this.distance / 20) },
      { key: 'time', value: parseFloat((this.elapsedTimeMs / 1000).toFixed(1)) },
      { key: 'items', value: this.score }
    ];
  
    let localRecord = false;
    let globalRecord = false;
    const newScores = [];
  
    for (const cat of categories) {
      if (await highScoreManager.isLocalRecord(cat.key, cat.value)) {
        localRecord = true;
        newScores.push({ category: cat.key, value: cat.value });
      } else if (await highScoreManager.isGlobalRecord(cat.key, cat.value)) {
        globalRecord = true;
        newScores.push({ category: cat.key, value: cat.value });
      }
    }
  
    const hadRecord = localRecord || globalRecord;
  
    if (hadRecord) {
      // ✨ Rekord - Be om namn
      this.add.text(centerX, centerY - 20, 'NEW RECORD! ENTER YOUR NAME', {
        fontSize: '14px', fill: '#FFFFFF', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5).setDepth(1001);
  
      if (isMobile()) {
        // Mobil: visa knapp för att mata in namn
        createButton(this, centerX, centerY + 40, 'Enter Name', async () => {
          const name = prompt('Enter your name:');
          if (name) {
            for (const score of newScores) {
              await highScoreManager.saveScore({ ...score, name: name.toUpperCase().substring(0, 12) });
            }
            this.scene.start('HighScoreScene');
          }
        });
      } else {
        // Desktop: skriv namn och tryck Enter
        this.inputText = '';
        const nameText = this.add.text(centerX, centerY + 40, 'NAME: ', {
          fontSize: '14px', fill: '#FFFFFF', fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5).setDepth(1001);
  
        this.input.keyboard.on('keydown', async (event) => {
          if (event.key === 'Backspace') {
            this.inputText = this.inputText.slice(0, -1);
          } else if (event.key.length === 1 && this.inputText.length < 12) {
            this.inputText += event.key.toUpperCase();
          } else if (event.key === 'Enter') {
            for (const score of newScores) {
              await highScoreManager.saveScore({ ...score, name: this.inputText });
            }
            this.scene.start('HighScoreScene');
          }
          nameText.setText('NAME: ' + this.inputText);
        });
      }
  
    } else {
      // 😢 Inget rekord
      this.add.text(centerX, centerY - 20, 'BETTER LUCK NEXT TIME!', {
        fontSize: '14px', fill: '#FFFFFF', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5).setDepth(1001);
  
      if (isMobile()) {
        // Mobil: knapp för att fortsätta
        createButton(this, centerX, centerY + 40, 'Continue', () => {
          this.scene.start('StartScene');
        });
      } else {
        // Desktop: SPACE för att fortsätta
        this.add.text(centerX, centerY + 40, 'PRESS SPACE TO CONTINUE', {
          fontSize: '14px', fill: '#FFFFFF', fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5).setDepth(1001);
  
        this.input.keyboard.once('keydown-SPACE', () => {
          this.scene.start('StartScene');
        });
      }
    }
  
    // 🎵 Byt till startmusiken
    if (this.music && this.music.isPlaying) {
      this.music.stop();
    }
    this.sound.get('music_start').play();
  }

  createObstacle(config) {
    const x = Phaser.Math.Between(this.spawnPadding, this.scale.width - this.spawnPadding);
    const y = this.scale.height + Phaser.Math.Between(50, 150);
    const sprite = this.add.sprite(x, y, config.sprite);
    sprite.setScale(config.scale);
    if (config.rotation) {
        const angleDeg = Phaser.Math.Between(-config.rotation, config.rotation);
        sprite.setAngle(angleDeg);
      }
    if (config.mirror && Math.random() < 0.5) {
      sprite.flipX = true;
    }  
    sprite.customHitbox = config.hitbox;
    sprite.setDepth(400);
    this.obstacles.add(sprite);
  }

  createCollectible(config) {
    const x = Phaser.Math.Between(this.spawnPadding, this.scale.width - this.spawnPadding);
    const y = this.scale.height + Phaser.Math.Between(50, 150);
    const sprite = this.add.sprite(x, y, config.sprite);
    sprite.setScale(config.scale);
    if (config.rotation) {
      const angleDeg = Phaser.Math.Between(-config.rotation, config.rotation);
      sprite.setAngle(angleDeg);
    }
    sprite.points = config.points;
    sprite.timeBonus = config.timeBonus;
    sprite.customHitbox = config.hitbox;
    this.collectibles.add(sprite);
  }

  textStyle() {
    return { fontSize: '12px', fill: '#020202', fontFamily: '"Press Start 2P"' };
  }
}

export { MainScene };