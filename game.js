// game.js — with correct structure/order for Phaser scene initialization

const objectConfigs = [
  {
    type: 'obstacle',
    sprite: 'tree',
    scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
    hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 }
  },
  {
    type: 'obstacle',
    sprite: 'snowman',
    scale: () => 0.15,
    hitbox: { x: 0.2, y: 0.65, width: 0.3, height: 0.2 }
  },
  {
    type: 'obstacle',
    delay: 4500,
    create: this.createObstacle,
    sprite: 'rock',
    scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
    hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 }
  },
  {
    type: 'collectible',
    sprite: 'can',
    scale: () => 0.04,
    points: 1,
    hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 }
  }
];

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('tree', 'assets/tree.png');
    this.load.image('can', 'assets/can.png');
    this.load.image('skier_left', 'assets/skier_left.png');
    this.load.image('snowman', 'assets/snowman.png');
    this.load.image('rock', 'assets/rock.png');
  }

  create() {
    this.objects = this.add.group();
    this.scrollSpeed = 2;
    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const conf = Phaser.Math.RND.pick(objectConfigs);
        const x = Phaser.Math.Between(50, config.width - 50);
        const obj = this.add.sprite(x, config.height + 50, conf.sprite).setScale(conf.scale());
        this.objects.add(obj);
      }
    });

    this.titleText = this.add.text(340, 150, 'Ski Patrol!', {
      fontSize: '32px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    const skierHeight = config.height * 0.4;
    this.bigSkier = this.add.sprite(config.width / 2, 300, 'skier_left')
      .setOrigin(0.5)
      .setDisplaySize(skierHeight * 0.75, skierHeight)
      .setDepth(1000);

    this.startText = this.add.text(340, 500, 'Press SPACE to play', {
      fontSize: '16px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });
  }

  update() {
    this.objects.getChildren().forEach(obj => {
      obj.y -= this.scrollSpeed;
      if (obj.y < -50) obj.destroy();
    });
  }
}

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' });
  }

  preload() {
    this.load.image('skier', 'assets/skier.png');
    this.load.image('skier_left', 'assets/skier_left.png');
    this.load.image('skier_right', 'assets/skier_right.png');
    this.load.image('skier_crash', 'assets/skier_crash.png');
    this.load.image('stars', 'assets/stars.png');
    this.load.image('tree', 'assets/tree.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('can', 'assets/can.png');
  }

  create() {
    this.score = 0;
    this.distance = 0;
    this.scrollSpeedY = 2;
    this.lateralSpeed = 0;
    this.collisionDisabled = false;
    this.gamePaused = false;
    this.gameOver = false;
    this.minSpeed = 2;
    this.maxSpeed = 6;
    this.timeMs = 0;
    this.maxTimeMs = 60000;
    this.obstacles = this.add.group();
    this.collectibles = this.add.group();
    this.debugGraphics = this.add.graphics();
    this.player = this.add.sprite(340, 200, 'skier').setScale(0.1);
    this.stars = this.add.sprite(this.player.x, this.player.y - 20, 'stars')
    .setScale(0.05)
    .setVisible(false)
    .setDepth(501);
    this.crashSkier = this.add.sprite(this.player.x, this.player.y, 'skier_crash')
      .setScale(0.1)
      .setVisible(false)
      .setDepth(500);    
    this.cursors = this.input.keyboard.createCursorKeys();

    this.timeText = this.add.text(20, 100, 'Time: 60.0s', textStyle()).setDepth(1000);
    this.scoreText = this.add.text(20, 120, 'Cans: 0', textStyle()).setDepth(1000);
    this.distanceText = this.add.text(20, 140, 'Distance: 0', textStyle()).setDepth(1000);

    this.objectConfigs = [
      {
        type: 'obstacle', 
          delay: 1000, 
          create: this.createObstacle, 
          config: () => ({
            sprite: 'tree',
            scale: Phaser.Math.FloatBetween(0.10, 0.25),
            hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 }
        })
      },
      {
        type: 'obstacle',
        delay: 4000,
        create: this.createObstacle,
        config: () => ({
          sprite: 'snowman',
          scale: 0.12,
          hitbox: { x: 0.2, y: 0.65, width: 0.3, height: 0.3 }
        })
      },
      {
        type: 'obstacle',
        delay: 4500,
        create: this.createObstacle,
        config: () => ({
          sprite: 'rock',
          scale: Phaser.Math.FloatBetween(0.08, 0.12),
          hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 }
        })
      },      
      {
        type: 'collectible', 
          delay: 3000, 
          create: this.createCollectible, 
          config: () => ({
            sprite: 'can',
            scale: 0.04,
            points: 1,
            hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 }
        })
      }
    ];

    this.obstacleTimers = [];
    this.collectibleTimers = [];

    this.objectConfigs.forEach(entry => {
      const timer = this.time.addEvent({
        delay: entry.delay,
        loop: true,
        callback: () => {
          entry.create.call(this, entry.config());
        }
      });
      if (entry.type === 'obstacle') this.obstacleTimers.push(timer);
      else this.collectibleTimers.push(timer);
    });
  }

  createObstacle(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height || 850, config.sprite);
    sprite.setScale(config.scale || 0.2);
    sprite.customHitbox = config.hitbox;
    this.obstacles.add(sprite);
  }

  createCollectible(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height || 850, config.sprite);
    sprite.setScale(config.scale || 0.05);
    sprite.points = config.points || 1;
    sprite.customHitbox = config.hitbox;
    this.collectibles.add(sprite);
  }

  update(time, delta) {
    if (this.gameOver) return;
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
    this.moveObjects();
    this.updateTime(delta);
    this.updateDistance();
    this.checkForCollisions();
  }

  moveObjects() {
    this.obstacles.getChildren().forEach(obj => {
      obj.y -= this.scrollSpeedY;
      obj.x += this.lateralSpeed;
      if (obj.y < -50) this.obstacles.remove(obj, true, true);
    });
    this.collectibles.getChildren().forEach(obj => {
      obj.y -= this.scrollSpeedY;
      obj.x += this.lateralSpeed;
      if (obj.y < -50) this.collectibles.remove(obj, true, true);
    });

    if (this.stars.visible) {
      this.stars.rotation += 0.1;
    }
  }

  updateDistance() {
    if (!this.gamePaused) {
      this.distance += this.scrollSpeedY;
      this.distanceText.setText('Distance: ' + Math.round(this.distance));
    }
  }

  updateTime(delta) {
    this.timeMs += delta;
    const timeLeft = Math.max(0, (this.maxTimeMs - this.timeMs) / 1000);
    this.timeText.setText('Time: ' + timeLeft.toFixed(1) + 's');
    if (timeLeft <= 0 && !this.gameOver) {
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
        obj.x - obj.displayWidth * box.x,
        obj.y - obj.displayHeight / 2 + obj.displayHeight * box.y,
        obj.displayWidth * box.width,
        obj.displayHeight * box.height
      );
      if (!this.collisionDisabled && !this.gamePaused && Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, bounds)) {
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
        this.score += obj.points;
        this.collectibles.remove(obj, true, true);
        this.scoreText.setText('Cans: ' + this.score);
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
    this.stars.setPosition(this.player.x, this.player.y - 40);
    this.player.setVisible(false);
    
    setTimeout(() => {
      this.debugGraphics.clear();
      this.gamePaused = false;
      this.scrollSpeedY = 2;
      this.collisionDisabled = true;
      this.stars.setVisible(false);
      this.crashSkier.setVisible(false);
      this.player.setVisible(true);
    }, 3000);
    setTimeout(() => {
      this.collisionDisabled = false;
    }, 6000);
  }

  endGame() {
    this.gameOver = true;
    this.scrollSpeedY = 0;
    this.lateralSpeed = 0;
    this.obstacleTimers.forEach(t => t.remove(false));
    this.collectibleTimers.forEach(t => t.remove(false));
    this.add.text(340, 400, 'GAME OVER', {
      fontSize: '48px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1001);
    this.add.text(340, 460, `Height: ${Math.round(this.distance)}\nCans: ${this.score}`, {
      fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"', align: 'center'
    }).setOrigin(0.5).setDepth(1001);
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('StartScene');
    });
  }
}

function textStyle() {
  return { fontSize: '12px', fill: '#ffffff', fontFamily: '"Press Start 2P"' };
}

const config = {
  type: Phaser.AUTO,
  width: 680,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: [StartScene, MainScene]
};

window.startGame = function () {
  new Phaser.Game(config);
};
