// ✅ Declare config globally so all functions can access it
const config = {
  type: Phaser.AUTO,
  width: 680,
  height: 800,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: {
    preload,
    create,
    update
  }
};

  // ✅ This gets called from index.html AFTER the font is loaded
  window.startGame = function () {
    new Phaser.Game(config); // create the game after font is ready
  };
    
  let player;
  let cursors;
  let trees;
  let score = 0;
  let collisionDisabled = false;
  let gamePaused = false;
  let pauseTimer = 0;
  let resumeTimer = 0;
  let canTimer, treeTimer;
  let minSpeed = 2;
  let maxSpeed = 6;
  let scrollSpeedY = 2;
  let debugGraphics;
  let cans;
  let distance = 0;
  let scoreText;
  let distanceText;
  let timeText;
  let maxTimeMs = 5 * 1000; // 60 sekunder
  let timeMs = 0;
  let gameOver = false;

  function preload() {
    this.load.image('skier', 'assets/skier.png');
    this.load.image('skier_left', 'assets/skier_left.png');
    this.load.image('skier_right', 'assets/skier_right.png');
    this.load.image('tree', 'assets/tree.png')
    this.load.image('can', 'assets/can.png');
  }

  function create() {
    player = this.add.sprite(config.width / 2, 200, 'skier').setScale(0.1);
    cursors = this.input.keyboard.createCursorKeys();
    debugGraphics = this.add.graphics();

    // Skapa första träd-gruppen
    trees = this.add.group();

    // Skapa ölburks-gruppen
    cans = this.add.group();

    // Skape time-text
    timeText = this.add.text(20, 100, 'Time: 60.0s', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"'
    }).setDepth(1000);

    // Skapa score-text
    scoreText = this.add.text(20, 120, 'Cans: 0', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"'
    }).setDepth(1000);

    // Skapa höjd-text
    distanceText = this.add.text(20, 140, 'Distance: 1000', {
      fontSize: '12px',
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"'
    }).setDepth(1000);


    // Starta en loopande timer med varierad fördröjning
    treeTimer = this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        createRandomTree.call(this);
      },
      callbackScope: this
    });

    canTimer = this.time.addEvent({
      delay: 3000,
      loop: true,
      callback: () => {
        createRandomCan.call(this); // Viktigt med .call(this) för Phaser-kontext
      },
      callbackScope: this
    });
  }
  
  function createRandomTree() {
    if (trees.getLength() > 50) return; // förhindra överbelastning
    const x = Phaser.Math.Between(50, config.width - 50);
    const scale = Phaser.Math.FloatBetween(0.10, 0.25); // ±15 % runt 0.3
    const tree = this.add.sprite(x, config.height + 50, 'tree').setScale(scale);
    trees.add(tree);
  }

  function createRandomCan() {
    const x = Phaser.Math.Between(50, config.width - 50);
    const can = this.add.sprite(x, config.height + 50, 'can').setScale(0.04);
    cans.add(can);
  }

  function triggerPause() {
    gamePaused = true;
    collisionDisabled = false;
    scrollSpeedY = 0;
    lateralSpeed = 0;
  
    console.log("💥 Krasch! Paus i 3 sek");
  
    // Efter 3 sek – återaktivera rörelse, men stäng av kollision
    setTimeout(() => {
      debugGraphics.clear();
      gamePaused = false;
      scrollSpeedY = 2;
      collisionDisabled = true;
      console.log("🛷 Immun i 3 sek");
    }, 3000);
  
    // Efter ytterligare 3 sek – aktivera kollision igen
    setTimeout(() => {
      collisionDisabled = false;
      console.log("✅ Kollision aktiv igen");
    }, 6000);
  }

  function updateDistance() {
    if (!gamePaused && !gameOver) {
      distance += scrollSpeedY;    
      distanceText.setText('Distance: ' + Math.round(distance));
    }
  }

  function updateTime(scene, delta) {
    timeMs += delta
    let timeLeft = Math.max(0, (maxTimeMs - timeMs) / 1000);
    timeText.setText('Time: ' + timeLeft.toFixed(1) + 's');
  
    if (timeLeft <= 0) {
      gameOver = true;
      endGame(scene); // separat funktion
    }
  }

  function moveObjects() {
    // Flytta träden
    const treeList = trees.getChildren();
    for (let i = 0; i < treeList.length; i++) {
      const tree = treeList[i];
      tree.y -= scrollSpeedY;
      tree.x += lateralSpeed;
    
      if (tree.y < -50) {
        trees.remove(tree, true, true); // tar bort från grupp + destroy i ett
      }
    } 

    // Flytta burkarna
    const canList = cans.getChildren();
    for (let i = 0; i < canList.length; i++) {
      const can = canList[i];
    
      if (!gamePaused) {
        can.y -= scrollSpeedY;
        can.x += lateralSpeed;
      }
    
      if (can.y < -50) {
        cans.remove(can, true, true);
      }
    }
  }

  function checkForCollisions() {
    if (!gamePaused && !collisionDisabled) {

      // Pick up cans
      const canList = cans.getChildren();
      canList.forEach(can => {
        const canBounds = can.getBounds();
        const skierBounds = new Phaser.Geom.Rectangle(
          player.x - player.displayWidth * 0.15,
          player.y - player.displayHeight * 0.15,
          player.displayWidth * 0.3,
          player.displayHeight * 0.4
        );
      
        if (Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, canBounds)) {
          cans.remove(can, true, true); // Ta bort burken
          score++;
          scoreText.setText('Cans: ' + score);          
          console.log("♻️ Plockade burk! Poäng:", score);
        }
      });

      // Make sure we did not crash into a tree
      trees.getChildren().forEach(tree => {
        const treeBounds = new Phaser.Geom.Rectangle(
          tree.x - tree.displayWidth * 0.15,              // 15 % vänsterkant
          tree.y + tree.displayHeight * 0.25,             // nedre fjärdedelen
          tree.displayWidth * 0.3,                        // 30 % bredd
          tree.displayHeight * 0.25                       // 25 % höjd
        );
    
        const skierBounds = new Phaser.Geom.Rectangle(
          player.x - player.displayWidth * 0.15,                // 30 % bredd (centrerat)
          player.y - player.displayHeight * 0.1,               // flytta ner toppen
          player.displayWidth * 0.3,
          player.displayHeight * 0.3                            // kortare höjd
        );

        if (Phaser.Geom.Intersects.RectangleToRectangle(skierBounds, treeBounds)) {
          // Rita bounding-boxar
          debugGraphics.lineStyle(1, 0x00ff00); // Grön: åkaren
          debugGraphics.strokeRectShape(skierBounds);
          debugGraphics.lineStyle(1, 0xff0000); // Röd: trädets träffzon
          debugGraphics.strokeRectShape(treeBounds);
          triggerPause();
        }
      });
    }
  }

  function endGame(scene) {
    console.log("⏰ Tiden är slut!");
    scrollSpeedY = 0;
    lateralSpeed = 0;

    if (canTimer) canTimer.remove(false);
    if (treeTimer) treeTimer.remove(false);
  
    scene.add.text(config.width / 2, config.height / 2, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ffff00',
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setDepth(1001);
  
    scene.add.text(config.width / 2, config.height / 2 + 60,
      `Height: ${Math.round(distance)}\nCans: ${score}`, {
        fontSize: '24px',
        fill: '#ffffff',
        fontFamily: '"Press Start 2P"',
        align: 'center'
    }).setOrigin(0.5).setDepth(1001);
  }

  function update(time, delta) {
    lateralSpeed = 0;

    // Control skier
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
        console.log("⬆️ Fart minskad:", scrollSpeedY);
      }
      
      if (Phaser.Input.Keyboard.JustDown(cursors.down)) {
        scrollSpeedY = Math.min(maxSpeed, scrollSpeedY + 1);
        console.log("⬇️ Fart ökad:", scrollSpeedY);
      }
    }

    if (!gameOver) {
      moveObjects();
      updateTime(this, delta);
      updateDistance();
      checkForCollisions();  
    }
  }
