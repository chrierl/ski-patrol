// StartScene.js
import { objectConfigs, weightedPick } from './objectConfigs.js';
import { config } from './game.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    this.load.image('tree', 'assets/tree.png');
    this.load.image('rock', 'assets/rock.png');
    this.load.image('snowman', 'assets/snowman.png');
    this.load.image('groomer', 'assets/groomer.png');
    this.load.image('simon', 'assets/simon.png'); 
    this.load.image('can', 'assets/can.png');
    this.load.image('bottle', 'assets/bottle.png');
    this.load.image('pole', 'assets/pole.png');
    this.load.image('skier_left', 'assets/skier_left.png');
    this.load.audio('music_start', 'assets/unfinished_paths.mp3');
    this.load.audio('music_game', 'assets/ski_patrol_theme.mp3');
    this.load.audio('pickup', 'assets/pickup.wav');
  }

  create() {
    
    if (this.sound.get('music_game')) this.sound.get('music_game').stop();
    if (this.sound.get('music_start')) this.sound.get('music_start').stop();
    if (!this.sound.get('music_start')) {
      this.sound.add('music_start', { loop: true, volume: 0.5 });
    }
    this.sound.get('music_start').play();

    this.objects = this.add.group();
    this.scrollSpeed = 2;
    this.difficultyOptions = ['Easy', 'Normal', 'Hard', 'Insane'];
    this.difficultyIndex = 1;

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => {
        const def = Phaser.Math.RND.pick(objectConfigs.filter(o => o.type === 'obstacle' || o.type === 'collectible'));
        const conf = def.config();
        const x = Phaser.Math.Between(50, config.width - 50);
        const obj = this.add.sprite(x, config.height + 50, def.sprite).setScale(conf.scale);
        this.objects.add(obj);
      }
    });

    this.titleText = this.add.text(config.width / 2, 200, 'Ski Patrol!', {
      fontSize: '32px', fill: '#E34234', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.bigSkier = this.add.sprite(config.width / 2, 300, 'skier_left')
      .setOrigin(0.5)
      .setDisplaySize(config.height * 0.3 * 0.75, config.height * 0.3)
      .setDepth(1000);

    this.startText = this.add.text(config.width / 2, 500, 'Press SPACE to play', {
      fontSize: '16px', fill: '#020202', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.difficultyText = this.add.text(config.width / 2, 560, 'Difficulty: Normal', {
      fontSize: '12px', fill: '#020202', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5).setDepth(1000);

    this.input.keyboard.once('keydown-SPACE', () => {
      const selected = this.difficultyOptions[this.difficultyIndex];
      this.scene.start('MainScene', { difficulty: selected });
    });

    this.input.keyboard.on('keydown-LEFT', () => {
      this.difficultyIndex = (this.difficultyIndex + 3) % 4;
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

    this.input.on('pointerdown', () => {
        const selected = this.difficultyOptions[this.difficultyIndex];
        this.scene.start('MainScene', { difficulty: selected });
      });
  }

  update() {
    this.objects.getChildren().forEach(obj => {
      obj.y -= this.scrollSpeed;
      if (obj.y < -50) obj.destroy();
    });
  }

}

export { StartScene };