// game.js – uppdaterad med viktade objekt, distansbaserat spawn, stjärnkrasch och gemensam konfiguration

const objectConfigs = [
  {
    type: 'obstacle',
    sprite: 'tree',
    weight: 25,
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
    weight: 2,
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
    type: 'obstacle',
    sprite: 'groomer',
    weight: 1, // tweak for rarity
    scale: () => 0.20,
    hitbox: { x: 0.2, y: 0.65, width: 0.4, height: 0.3 },
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
    timeBonus: 1000,
    hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 },
    config() {
      return {
        sprite: this.sprite,
        scale: this.scale(),
        hitbox: this.hitbox,
        points: this.points,
        timeBonus: this.timeBonus
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
    this.load.audio('music_start', 'assets/unfinished_paths.mp3');
    this.load.audio('music_game', 'assets/ski_patrol_theme.mp3');
  }

  create() {

    // Stop any existing music
    if (this.sound.get('music_game')) {
      this.sound.get('music_game').stop();
    }
    if (this.sound.get('music_start')) {
      this.sound.get('music_start').stop();
    }

    // Create or reuse start music
    if (!this.sound.get('music_start')) {
      this.sound.add('music_start', { loop: true, volume: 0.5 });
    }

    this.sound.get('music_start').play();

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

// HighScoreScene.js

class HighScoreScene extends Phaser.Scene {  

  constructor() {
    super({ key: 'HighScoreScene' });
  }

  init(data) {
    this.runData = data; // contains distance, time, score
  }

  preload() {
  }

  drawHighscoreText() {
    this.highscoreTexts.forEach(t => t.destroy());
    this.highscoreTexts = [];

    this.highscoreTexts.push(
    this.add.text(config.width / 2, 110, 'HIGH SCORES', {
      fontSize: '24px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5));

    let yOffset = 130;

    this.categories.forEach((cat, index) => {
      const key = `highscore_${cat.key}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      this.highscores[cat.key] = list;

      const place = this.getPlacement(list, cat.value);
      if (place < 10) {
        this.placedIn.push(cat);
      }

      this.highscoreTexts.push(
      this.add.text(60, yOffset, cat.label, {
        fontSize: '14px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
      }));

      const displayList = [...list];
      if (place < 10) {
        displayList.splice(place, 0, { name: '???', value: cat.value });
        displayList.length = 10;
      }

      displayList.forEach((entry, i) => {
        const rank = `${i + 1}.`.padStart(4, ' ');  // " 1.", "10.", etc.
        const name = (entry.name || '---').padEnd(12, ' ');
        const value = String(entry.value).padStart(5, ' ');
        const label = `${rank} ${name} ${value}`;
        this.highscoreTexts.push(this.add.text(60, yOffset + 20 + i * 16, label, {
          fontSize: '12px', fill: '#ffffff', fontFamily: '"Press Start 2P"'
        }));
      });

      yOffset += 210;
    });

    if (this.placedIn.length > 0) {
      this.inputText = '';
      this.nameText = this.add.text(config.width / 2, config.height - 40, 'ENTER NAME: ', {
        fontSize: '14px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);
      this.highscoreTexts.push(this.nameText);

      this.input.keyboard.on('keydown', (event) => {
        if (event.key === 'Backspace') {
          this.inputText = this.inputText.slice(0, -1);
        } else if (event.key.length === 1 && this.inputText.length < 12) {
          this.inputText += event.key.toUpperCase();
        } else if (event.key === 'Enter' || event.key === ' ') {
          this.saveScores();
          this.showContinuePrompt(); // new method
        }
        this.nameText.setText('ENTER NAME: ' + this.inputText);
      });
    } else {
      this.showContinuePrompt();
    }
  }

  create() {
    this.highscoreTexts = [];



    this.categories = [
      { key: 'distance', label: 'Meters Skied', value: Math.round(this.runData.distance / 20) },
      { key: 'time', label: 'Time Survived', value: parseFloat((this.runData.elapsedTimeMs / 1000).toFixed(1)) },
      { key: 'points', label: 'Points Collected', value: this.runData.score }
    ];

    this.placedIn = []; // categories where player got into top 10
    this.highscores = {};

    this.drawHighscoreText();
  }

  showContinuePrompt() {
    if (this.nameText) {
      this.nameText.setVisible(false);
    }
  
    this.add.text(config.width / 2, config.height - 40, 'PRESS SPACE TO RETURN', {
      fontSize: '14px',
      fill: '#00ffff',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('StartScene');
    });
  }

  getPlacement(list, value) {
    for (let i = 0; i < list.length; i++) {
      if (value > list[i].value) return i;
    }
    return list.length < 10 ? list.length : 10;
  }

  buildDisplayLists() {
    this.displayLists = {};
  
    this.categories.forEach(cat => {
      const key = `highscore_${cat.key}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
  
      this.displayLists[cat.key] = list;  
    });
    this.drawHighscoreText();
  }


  saveScores() {
    this.placedIn.forEach(cat => {
      const key = `highscore_${cat.key}`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
  
      const entry = {
        name: this.inputText,
        value: cat.value
      };
  
      const place = this.getPlacement(list, cat.value);
      list.splice(place, 0, entry);
      if (list.length > 10) list.length = 10;
  
      localStorage.setItem(key, JSON.stringify(list));
      this.placedIn.forEach(cat => {
        const key = `highscore_${cat.key}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
      
        const entry = { name: this.inputText, value: cat.value };
        const place = this.getPlacement(list, cat.value);
        list.splice(place, 0, entry);
        list.length = 10;
      
        localStorage.setItem(key, JSON.stringify(list));
      });
    });
    this.buildDisplayLists();
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
    this.elapsedTimeMs = 0;    // Always increasing — used for highscore "Time Survived"
    this.remainingTimeMs = 10 * 1000; // Decreasing — used for game timer
    this.spawnAccumulator = 0;
    this.obstacleSpawnChance = 0.05;
    this.collectibleSpawnChance = 0.03;
    let obstacleSpawnChance = 0.05;
    let collectibleSpawnChance = 0.03;

    // Stop menu music
    if (this.sound.get('music_start')) {
      this.sound.get('music_start').stop();
    }
    // Create or reuse game music
    if (!this.sound.get('music_game')) {
      this.sound.add('music_game', { loop: true, volume: 0.5 });
    }
    this.sound.get('music_game').play();
    
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
        obstacleSpawnChance = 0.12;
        collectibleSpawnChance = 0.02;
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
      if (obj.y > this.player.y) {
        obj.setDepth(600);
      } else {
        obj.setDepth(400);
      }
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
        this.score += obj.points || 0;
        this.scoreText.setText('Cans: ' + this.score);
        console.log(`⏱️ +${obj.timeBonus / 1000}s time bonus 1`);      
      
        // ✅ Time bonus from collectible
        if (obj.timeBonus) {
          this.remainingTimeMs += obj.timeBonus;
          // Optional visual feedback
          this.timeText.setColor('#00ff00');
          this.time.delayedCall(300, () => {
            this.timeText.setColor('#ffffff');
          });
          console.log(`⏱️ +${obj.timeBonus / 1000}s time bonus 2`);
        }
      
        obj.destroy(); // ❗ Call this last so we still have access to the bonus
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

    }, 3000);

    setTimeout(() => {
      this.collisionDisabled = false;
      if (this.blinkTimer) {
        this.blinkTimer.remove(false);
        this.blinkTimer = null;
      }
      this.player.setVisible(true);
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
      `Distance: ${Math.round(this.distance / 20)} m\nCollected: ${this.score}`, {
        fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"', align: 'center'
    }).setOrigin(0.5).setDepth(1001);

    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('HighScoreScene', {
        distance: this.distance,
        elapsedTimeMs: this.elapsedTimeMs,
        score: this.score
      });
    });

    // Stop game music
    if (this.sound.get('music_game')) {
      this.sound.get('music_game').stop();
    }

    // Start start music
    if (!this.sound.get('music_start')) {
      this.sound.add('music_start', { loop: true, volume: 0.5 });
    }

    this.sound.get('music_start').play();
  }

  createObstacle(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height, config.sprite);    sprite.setScale(config.scale);
    sprite.customHitbox = config.hitbox;
    sprite.setDepth(400);
    this.obstacles.add(sprite);
  }

  createCollectible(config) {
    const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
    const sprite = this.add.sprite(x, config.height, config.sprite);
    sprite.setScale(config.scale);
    sprite.points = config.points;
    sprite.timeBonus = config.timeBonus;
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
  scene: [StartScene, MainScene, HighScoreScene]
};

window.startGame = function () {
  new Phaser.Game(config);
};


