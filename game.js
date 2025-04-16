// game.js – uppdaterad med viktade objekt, distansbaserat spawn, stjärnkrasch och gemensam konfiguration

const objectConfigs = [
  {
    type: 'obstacle',
    sprite: 'tree',
    weight: 20,
    scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
    hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 },
    config() {
      return {
        sprite: this.sprite,
        scale: this.scale(),
        hitbox: this.hitbox
      };
    }
  },
  {
    type: 'obstacle',
    sprite: 'rock',
    weight: 8,
    scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
    hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.25 },
    config() {
      return {
        sprite: this.sprite,
        scale: this.scale(),
        hitbox: this.hitbox
      };
    }
  },
  {
    type: 'obstacle',
    sprite: 'snowman',
    weight: 1,
    scale: () => 0.12,
    hitbox: { x: 0.2, y: 0.65, width: 0.3, height: 0.3 },
    config() {
      return {
        sprite: this.sprite,
        scale: this.scale(),
        hitbox: this.hitbox
      };
    }
  },
  {
    type: 'collectible',
    sprite: 'can',
    weight: 8,
    scale: () => 0.04,
    points: 1,
    hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 },
    config() {
      return {
        sprite: this.sprite,
        scale: this.scale(),
        hitbox: this.hitbox,
        points: this.points
      };
    }
  }
];

function weightedPick(items) {
  const weighted = [];
  items.forEach(item => {
    for (let i = 0; i < (item.weight || 1); i++) {
      weighted.push(item);
    }
  });
  return Phaser.Math.RND.pick(weighted);
}

class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('tree', 'assets/tree.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('snowman', 'assets/snowman.png');
    this.load.image('can', 'assets/can.png');
    this.load.image('skier_left', 'assets/skier_left.png');
  }

  create() {
    this.objects = this.add.group();
    this.scrollSpeed = 2;
    this.difficultyOptions = ['Easy', 'Normal', 'Hard', 'Insane'];
    this.difficultyIndex = 1; // default: Normal

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const def = weightedPick(objectConfigs.filter(o => o.type === 'obstacle' || o.type === 'collectible'));
        const conf = def.config();
        const x = Phaser.Math.Between(50, config.width - 50);
        const obj = this.add.sprite(x, config.height + 50, def.sprite).setScale(conf.scale);
        this.objects.add(obj);
      }
    });

    this.titleText = this.add.text(config.width / 2, 200, 'Ski Patrol!', {
      fontSize: '32px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.bigSkier = this.add.sprite(config.width / 2, 300, 'skier_left')
      .setOrigin(0.5)
      .setDisplaySize(config.height * 0.3 * 0.75, config.height * 0.3)
      .setDepth(1000);

    this.startText = this.add.text(config.width / 2, 500, 'Press SPACE to play', {
      fontSize: '16px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.difficultyText = this.add.text(config.width / 2, 560,
      'Difficulty: Normal', {
        fontSize: '12px',
        fill: '#ffffff',
        fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.input.keyboard.once('keydown-SPACE', () => {
      const selected = this.difficultyOptions[this.difficultyIndex];
      this.scene.start('MainScene', { difficulty: selected });
    });

    this.input.keyboard.on('keydown-LEFT', () => {
      this.difficultyIndex = (this.difficultyIndex + 3) % 4; // gå baklänges
      this.updateDifficultyText();
    });
    
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.difficultyIndex = (this.difficultyIndex + 1) % 4;
      this.updateDifficultyText();
    });

    this.updateDifficultyText = () => {
      const label = this.difficultyOptions[this.difficultyIndex];
      this.difficultyText.setText('Difficulty: ' + label);
    };
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
    objectConfigs.forEach(o => this.load.image(o.sprite, `assets/${o.sprite}.png`));
  }

  create(data) {
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
    this.spawnAccumulator = 0;
    this.obstacleSpawnChance = 0.05;
    this.collectibleSpawnChance = 0.03;

    let obstacleSpawnChance = 0.05;
    let collectibleSpawnChance = 0.03;
    
    switch (data.difficulty) {
      case 'Easy':
        obstacleSpawnChance = 0.03;
        collectibleSpawnChance = 0.04;
        break;
      case 'Normal':
        obstacleSpawnChance = 0.05;
        collectibleSpawnChance = 0.03;
        break;
      case 'Hard':
        obstacleSpawnChance = 0.07;
        collectibleSpawnChance = 0.025;
        break;
      case 'Insane':
        obstacleSpawnChance = 0.1;
        collectibleSpawnChance = 0.01;
        break;
    }
    this.obstacleSpawnChance = obstacleSpawnChance;
    this.collectibleSpawnChance = collectibleSpawnChance;

    this.obstacles = this.add.group();
    this.collectibles = this.add.group();
    this.debugGraphics = this.add.graphics();
    this.player = this.add.sprite(config.width / 2, 200, 'skier').setScale(0.1).setDepth(500);
    this.crashSkier = this.add.sprite(this.player.x, this.player.y, 'skier_crash').setScale(0.1).setVisible(false).setDepth(500);
    this.stars = this.add.sprite(this.player.x, this.player.y - 20, 'stars').setScale(0.15).setVisible(false).setDepth(501);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.timeText = this.add.text(20, 100, 'Time: 60.0s', textStyle()).setDepth(1000);
    this.scoreText = this.add.text(20, 120, 'Cans: 0', textStyle()).setDepth(1000);
    this.distanceText = this.add.text(20, 140, 'Distance: 0', textStyle()).setDepth(1000);
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
    this.updateDistance();
    this.updateTime(delta);
    this.checkForCollisions();

    if (this.stars.visible) this.stars.rotation += 0.1;
  }

  moveObjects() {
    [...this.obstacles.getChildren(), ...this.collectibles.getChildren()].forEach(obj => {
      obj.y -= this.scrollSpeedY;
      obj.x += this.lateralSpeed;
      if (obj.y < -50) obj.destroy();
    });
  }

  updateDistance() {
    if (!this.gamePaused) {
      this.distance += this.scrollSpeedY;
      this.distanceText.setText('Distance: ' + Math.round(this.distance));
      this.spawnAccumulator += this.scrollSpeedY;
      this.spawnObjectsContinuously();
    }
  }

  spawnObjectsContinuously() {
    const obstacleDefs = objectConfigs.filter(o => o.type === 'obstacle');
    const collectibleDefs = objectConfigs.filter(o => o.type === 'collectible');
    
    if (Phaser.Math.FloatBetween(0, 1) < this.obstacleSpawnChance) {
      const conf = weightedPick(obstacleDefs).config();
      conf.height = Phaser.Math.Between(config.height + 50, config.height + 150);
      this.createObstacle(conf);
    }
    
    if (Phaser.Math.FloatBetween(0, 1) < this.collectibleSpawnChance) {
      const conf = weightedPick(collectibleDefs).config();
      conf.height = Phaser.Math.Between(config.height + 50, config.height + 150);
      this.createCollectible(conf);
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
        obj.destroy();
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
    }, 3000);

    setTimeout(() => {
      this.collisionDisabled = false;
    }, 6000);
  }

  endGame() {
    this.gameOver = true;
    this.scrollSpeedY = 0;
    this.lateralSpeed = 0;

    this.add.text(config.width / 2, config.height / 2, 'GAME OVER', {
      fontSize: '48px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1001);

    this.add.text(config.width / 2, config.height / 2 + 60,
      `Height: ${Math.round(this.distance)}\nCans: ${this.score}`, {
        fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"', align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('StartScene');
    });
  }

  createObstacle(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height, config.sprite);    sprite.setScale(config.scale);
    sprite.customHitbox = config.hitbox;
    this.obstacles.add(sprite);
  }

  createCollectible(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height, config.sprite);
    sprite.setScale(config.scale);
    sprite.points = config.points;
    sprite.customHitbox = config.hitbox;
    this.collectibles.add(sprite);
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
