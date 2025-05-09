import { objectConfigs, weightedPick } from './objectConfigs.js';
import { isMobile, createButton } from './helpers.js';

export default class StartScene extends Phaser.Scene {
  constructor() {
    super({ key: 'StartScene' });
  }

  preload() {
    // Load progress handling
    this.loadingTextsDestroyed = false;
    const { width, height } = this.scale;

    this.loadingText = this.add.text(width / 2, height / 2 - 30, 'Loading... 0%', {
      fontSize: '16px',
      fill: '#888888',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  
    this.fileText = this.add.text(width / 2, height / 2, '', {
      fontSize: '10px',
      fill: '#888888',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  
    this.load.on('progress', (value) => {
      if (this.loadingText && !this.loadingTextsDestroyed) {
        this.loadingText.setText('Loading... ' + Math.round(value * 100) + '%');
      }
    });
    
    // Resources to pre-load
    this.load.image('logo', 'assets/sprites/ski_patrol_logo.png');
    this.load.image('tree', 'assets/sprites/tree.png');
    this.load.image('tree_snowy', 'assets/sprites/tree_snowy.png');
    this.load.image('rock', 'assets/sprites/rock.png');
    this.load.image('reindeer', 'assets/sprites/reindeer.png');
    this.load.image('cabin', 'assets/sprites/cabin.png');
    this.load.image('rock_narrow', 'assets/sprites/rock_narrow.png');
    this.load.image('snowman', 'assets/sprites/snowman.png');
    this.load.image('simon', 'assets/sprites/simon.png');
    this.load.image('groomer', 'assets/sprites/groomer.png');
    this.load.image('snowmobile_red', 'assets/sprites/snowmobile_red.png');
    this.load.image('snowmobile_yellow', 'assets/sprites/snowmobile_yellow.png');
    this.load.image('can', 'assets/sprites/can.png');
    this.load.image('bottle', 'assets/sprites/bottle.png');
    this.load.image('pole', 'assets/sprites/pole.png');
    this.load.image('ski_pass', 'assets/sprites/ski_pass.png');
    this.load.image('mobile', 'assets/sprites/mobile.png');
    this.load.image('bird', 'assets/sprites/bird.png');
    this.load.image('hang_glider', 'assets/sprites/hang_glider.png');
    this.load.image('hang_glider', 'assets/sprites/hang_glider_sp.png');
    this.load.image('fog', 'assets/sprites/fog.png');
    this.load.image('chopper', 'assets/sprites/chopper.png');
    this.load.audio('music_start', 'assets/audio/unfinished_paths.mp3');
    this.load.audio('music_game', 'assets/audio/ski_patrol_theme.mp3');
    this.load.audio('pickup', 'assets/audio/pickup.wav');
  }

  create() {
    
    // Remove load progress
    this.loadingText?.destroy();
    this.loadingTextsDestroyed = true;    

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
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const obj = this.add.sprite(x, this.scale.height + 50, def.sprite).setScale(conf.scale);
        if (conf.rotation) {
          const angleDeg = Phaser.Math.Between(-conf.rotation, conf.rotation);
          obj.setAngle(angleDeg);
        }
        if (conf.mirror && Math.random() < 0.5) {
          obj.flipX = true;
        }
        this.objects.add(obj);
      }
    });

    const centerX = this.scale.width / 2;
    const height = this.scale.height;
    this.titleLogo = this.add.sprite(centerX, 150,'logo')
      .setOrigin(0.5)
      .setDisplaySize(height * 0.5, height * 0.4)
      .setDepth(1000);

    // Read stored skier from settings in localstorage
    const storedSkier = JSON.parse(localStorage.getItem('selectedSkier'));
    const defaultSkierBase = 'skiers/joe/joe';
    const skierImageBase = storedSkier?.base || defaultSkierBase;
    const skierTextureKey = 'current_skier';

    if (this.textures.exists(skierTextureKey)) {
      this.textures.remove(skierTextureKey);
    }

    this.load.image(skierTextureKey, `assets/${skierImageBase}_left.png`);
    this.load.once('complete', () => {
      this.bigSkier = this.add.sprite(this.scale.width / 2, 300, skierTextureKey)
        .setOrigin(0.5)
        .setDisplaySize(this.scale.height * 0.3 * 0.75, this.scale.height * 0.3)
        .setDepth(1000);
    });
    this.load.start();

    this.setupStartScreen();
    this.setupKeyboardControls();
    this.startMusic();
  }

  setupStartScreen() {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const bottom = this.scale.height;
  
    if (isMobile()) {
      // 📱 Mobil: Visa knappar
      createButton(this, centerX, bottom - 220, 'START', () => {
        this.scene.start('MainScene');
      });
  
      createButton(this, centerX, bottom - 160, 'HIGH SCORES', () => {
        this.scene.start('HighScoreScene');
      });

      createButton(this, centerX, bottom - 100, 'SETTINGS', () => {
        this.scene.start('SettingsScene');
      });
    } else {
      // 🖥️ Desktop: Visa textinstruktioner istället
      this.add.text(centerX, centerY + 60, 'PRESS SPACE TO START', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#222222'
      }).setOrigin(0.5);
  
      this.add.text(centerX, centerY + 100, 'PRESS ENTER FOR HIGH SCORES', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#222222'
      }).setOrigin(0.5);

      this.add.text(centerX, centerY + 140, 'PRESS TAB FOR SETTINGS', {
        fontFamily: '"Press Start 2P"',
        fontSize: '14px',
        color: '#222222'
      }).setOrigin(0.5);
    }
  }

  setupKeyboardControls() {
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('MainScene');
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.start('HighScoreScene');
    });

    this.input.keyboard.once('keydown-TAB', (event) => {
      event.preventDefault(); // Så vi inte hoppar ut från canvas
      this.scene.start('SettingsScene');
    });
  }

  update() {
    this.objects.getChildren().forEach(obj => {
      obj.y -= this.scrollSpeed;
      if (obj.y < -50) obj.destroy();
    });
  }

  startMusic() {
    if (this.sound.get('music_game')) this.sound.get('music_game').stop();
  
    let music = this.sound.get('music_start');
    if (!music) {
      music = this.sound.add('music_start', { loop: true, volume: 0.5 });
    }
  
    if (!music.isPlaying) {
      music.play();
    }
  }
}