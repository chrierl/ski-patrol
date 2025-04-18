// MainScene.js
import { objectConfigs, weightedPick } from './objectConfigs.js';
import { config } from './game.js';

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('skier', 'assets/skier.png');
    this.load.image('skier_left', 'assets/skier_left.png');
    this.load.image('skier_right', 'assets/skier_right.png');
    this.load.image('skier_crash', 'assets/skier_crash.png');
    this.load.image('stars', 'assets/stars.png');
    objectConfigs.forEach(o => this.load.image(o.sprite, `assets/${o.sprite}.png`));
  }

  create(data = {}) {
    this.score = 0;
    this.distance = 0;
    this.scrollSpeedY = 2;
    this.lateralSpeed = 0;
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

    const difficulty = data.difficulty || 'Normal';
    const settings = difficultyMap[difficulty];
    this.obstacleSpawnChance = settings.obstacle;
    this.collectibleSpawnChance = settings.collectible;
    this.adjustedObstacleChance = this.obstacleSpawnChance * widthScaleFactor;
    this.adjustedCollectibleChance = this.collectibleSpawnChance * widthScaleFactor;

    this.pickupSound = this.sound.add('pickup');
    if (this.sound.get('music_start')) {
        this.sound.get('music_start').stop();
      }
    if (!this.sound.get('music_game')) {
        this.sound.add('music_game', { loop: true, volume: 0.5 });
    }
    this.sound.get('music_game').play();

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
        this.leftBtn = this.add.text(50, this.scale.height - 100, '<', textStyle())
          .setInteractive()
          .on('pointerdown', () => this.touchLeft = true)
          .on('pointerup', () => this.touchLeft = false);
      
        this.rightBtn = this.add.text(130, this.scale.height - 100, '>', textStyle())
          .setInteractive()
          .on('pointerdown', () => this.touchRight = true)
          .on('pointerup', () => this.touchRight = false);
      }
}

  update(time, delta) {
    //if (this.gameOver) return;
    this.lateralSpeed = 0;

    if (!this.gamePaused) {
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
    }
    if (!this.gamePaused) {
        if (this.cursors.left.isDown || this.touchLeft) {
          this.player.setTexture('skier_left');
          this.lateralSpeed = 1.5;
        } else if (this.cursors.right.isDown || this.touchRight) {
          this.player.setTexture('skier_right');
          this.lateralSpeed = -1.5;
        }
      }

    this.moveObjects();
    this.updateDistance();
    this.updateTime(delta);
    this.checkForCollisions();

    if (this.stars.visible) this.stars.rotation += 0.1;
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

  endGame() {
    this.gameOver = true;
    this.scrollSpeedY = 0;
    this.lateralSpeed = 0;

    this.add.text(this.scale.width / 2, this.scale.height / 2, 'GAME OVER', {
      fontSize: '48px', fill: '#E34234', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 60,
      `Distance: ${Math.round(this.distance / 20)} m\nCollected: ${this.score}`, {
        fontSize: '24px', fill: '#020202', fontFamily: '"Press Start 2P"', align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('HighScoreScene', {
        distance: this.distance,
        elapsedTimeMs: this.elapsedTimeMs,
        score: this.score
      });
    });

    this.sound.get('music_game')?.stop();
    if (!this.sound.get('music_start')) {
      this.sound.add('music_start', { loop: true, volume: 0.5 });
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