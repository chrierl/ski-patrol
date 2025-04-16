// Refactored version of your game.js with support for reusable obstacle and collectible types with configurable spawn frequency from a config list

const config = {
  type: Phaser.AUTO,
  width: 680,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: { preload, create, update }
};

window.startGame = function () {
  new Phaser.Game(config);
};

let player, cursors, debugGraphics;
let obstacles, collectibles;
let score = 0, distance = 0;
let scrollSpeedY = 2, lateralSpeed = 0;
let collisionDisabled = false, gamePaused = false, gameOver = false;
let minSpeed = 2, maxSpeed = 6;
let scoreText, distanceText, timeText;
let timeMs = 0, maxTimeMs = 60000;
let obstacleTimers = [], collectibleTimers = [];

const objectConfigs = [
  {
    type: 'obstacle',
    delay: 1000,
    create: createObstacle,
    config: () => ({
      sprite: 'tree',
      scale: Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.15, y: 0.70, width: 0.3, height: 0.20 },
    })
  },
  {
    type: 'collectible',
    delay: 3000,
    create: createCollectible,
    config: () => ({
      sprite: 'can',
      scale: 0.04,
      points: 1,
      hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 }
    })
  }
];

function preload() {
  this.load.image('skier', 'assets/skier.png');
  this.load.image('skier_left', 'assets/skier_left.png');
  this.load.image('skier_right', 'assets/skier_right.png');
  this.load.image('tree', 'assets/tree.png');
  this.load.image('can', 'assets/can.png');
}

function create() {
  player = this.add.sprite(config.width / 2, 200, 'skier').setScale(0.1);
  cursors = this.input.keyboard.createCursorKeys();
  debugGraphics = this.add.graphics();

  obstacles = this.add.group();
  collectibles = this.add.group();

  timeText = this.add.text(20, 100, 'Time: 60.0s', textStyle()).setDepth(1000);
  scoreText = this.add.text(20, 120, 'Cans: 0', textStyle()).setDepth(1000);
  distanceText = this.add.text(20, 140, 'Distance: 0', textStyle()).setDepth(1000);

  // Start timers from config list
  objectConfigs.forEach(entry => {
    const timer = this.time.addEvent({
      delay: entry.delay,
      loop: true,
      callback: () => {
        entry.create.call(this, entry.config());
      }
    });
    if (entry.type === 'obstacle') obstacleTimers.push(timer);
    else if (entry.type === 'collectible') collectibleTimers.push(timer);
  });
}

function createObstacle(config) {
  const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
  const sprite = this.add.sprite(x, config.y || 850, config.sprite);
  sprite.setScale(config.scale || 0.2);
  sprite.customHitbox = config.hitbox;
  obstacles.add(sprite);
}

function createCollectible(config) {
  const x = Phaser.Math.Between(50, config.width || config.widthRange?.[1] || 630);
  const sprite = this.add.sprite(x, config.y || 850, config.sprite);
  sprite.setScale(config.scale || 0.05);
  sprite.points = config.points || 1;
  sprite.customHitbox = config.hitbox;
  collectibles.add(sprite);
}

function moveObjects() {
  obstacles.getChildren().forEach(obj => {
    obj.y -= scrollSpeedY;
    obj.x += lateralSpeed;
    if (obj.y < -50) obstacles.remove(obj, true, true);
  });
  collectibles.getChildren().forEach(obj => {
    obj.y -= scrollSpeedY;
    obj.x += lateralSpeed;
    if (obj.y < -50) collectibles.remove(obj, true, true);
  });
}

function drawDebugBox(graphics, rect, color = 0xff0000) {
  graphics.lineStyle(1, color);
  graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
}

function checkForCollisions() {
  const skierBounds = new Phaser.Geom.Rectangle(
    player.x - player.displayWidth * 0.15,
    player.y - player.displayHeight * 0.1,
    player.displayWidth * 0.3,
    player.displayHeight * 0.3
  );

  obstacles.getChildren().forEach(obj => {
    const box = obj.customHitbox;
    const bounds = new Phaser.Geom.Rectangle(
      obj.x - obj.displayWidth * box.x,
      obj.y - obj.displayHeight / 2 + obj.displayHeight * box.y,
      obj.displayWidth * box.width,
      obj.displayHeight * box.height
    );
    if (!collisionDisabled && !gamePaused && Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, bounds)) {
      drawDebugBox(debugGraphics, skierBounds, 0x00ff00); // Grön
      drawDebugBox(debugGraphics, bounds, 0xff0000); // Röd
      triggerPause();  
    }
  });

  collectibles.getChildren().forEach(obj => {
    const box = obj.customHitbox;
    const bounds = new Phaser.Geom.Rectangle(
      obj.x - obj.displayWidth * box.x,
      obj.y - obj.displayHeight * box.y,
      obj.displayWidth * box.width,
      obj.displayHeight * box.height
    );
    if (!gamePaused && Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, bounds)) {
      score += obj.points;
      collectibles.remove(obj, true, true);
      scoreText.setText('Cans: ' + score);
    }
  });
}

function updateDistance() {
  if (!gamePaused && !gameOver) {
    distance += scrollSpeedY;
    distanceText.setText('Distance: ' + Math.round(distance));
  }
}

function updateTime(scene, delta) {
  timeMs += delta;
  const timeLeft = Math.max(0, (maxTimeMs - timeMs) / 1000);
  timeText.setText('Time: ' + timeLeft.toFixed(1) + 's');
  if (timeLeft <= 0 && !gameOver) {
    gameOver = true;
    endGame(scene);
  }
}

function triggerPause() {
  gamePaused = true;
  collisionDisabled = false;
  scrollSpeedY = 0;
  lateralSpeed = 0;

  setTimeout(() => {
    debugGraphics.clear();
    gamePaused = false;
    scrollSpeedY = 2;
    collisionDisabled = true;
  }, 3000);

  setTimeout(() => {
    collisionDisabled = false;
  }, 6000);
}

function endGame(scene) {
  scrollSpeedY = 0;
  lateralSpeed = 0;
  obstacleTimers.forEach(t => t.remove(false));
  collectibleTimers.forEach(t => t.remove(false));

  scene.add.text(config.width / 2, config.height / 2, 'GAME OVER', {
    fontSize: '48px', fill: '#ffff00', fontFamily: '"Press Start 2P"'
  }).setOrigin(0.5).setDepth(1001);

  scene.add.text(config.width / 2, config.height / 2 + 60,
    `Height: ${Math.round(distance)}\nCans: ${score}`, {
      fontSize: '24px', fill: '#ffffff', fontFamily: '"Press Start 2P"', align: 'center'
  }).setOrigin(0.5).setDepth(1001);
}

function update(time, delta) {
  lateralSpeed = 0;

  if (!gamePaused) {
    if (cursors.left.isDown) {
      player.setTexture('skier_left');
      lateralSpeed = 1.5;
    } else if (cursors.right.isDown) {
      player.setTexture('skier_right');
      lateralSpeed = -1.5;
    } else {
      player.setTexture('skier');
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.up)) {
      scrollSpeedY = Math.max(minSpeed, scrollSpeedY - 1);
    }
    if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
      scrollSpeedY = Math.min(maxSpeed, scrollSpeedY + 1);
    }
  }

  if (!gameOver) {
    moveObjects();
    updateTime(this, delta);
    updateDistance();
    checkForCollisions();
  }
}

function textStyle() {
  return { fontSize: '12px', fill: '#ffffff', fontFamily: '"Press Start 2P"' };
}
