// SettingsScene.js
import { isMobile, createButton } from './helpers.js';

export default class SettingsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SettingsScene' });

    this.skierOptions = [
        { name: 'Joe', base: 'skiers/skier' },
        { name: 'Simon', base: 'skiers/simon' },
        { name: 'Sofia', base: 'skiers/sofia' },
        { name: 'Vader', base: 'skiers/skier_black' },
        { name: 'Starski', base: 'skiers/starski' },
        { name: 'Stonemark', base: 'skiers/stonemark' },        
      ];
    this.musicOptions = [
      { name: 'Ski Patrol Theme', file: 'audio/ski_patrol_theme.mp3' },
      { name: 'Chairlift Chill', file: 'audio/chairlift_chill.mp3' },
      { name: 'Pixel Peaks', file: 'audio/pixel_peaks.mp3' },
      { name: 'Downhill Rush', file: 'audio/downhill_rush.mp3' }
    ];

    this.selectedSkierIndex = 0;
    this.selectedSongIndex = 0;
    this.currentSelection = 'skier';
  }

  preload() {
    if (this.textures.exists('current_skier')) {
        this.textures.remove('current_skier');
      }
    // Preload skier
    let skierBase = this.skierOptions[0].base;
    const savedSkier = localStorage.getItem('selectedSkier');
    if (savedSkier) {
      try {
        const parsed = JSON.parse(savedSkier);
        if (parsed.base) skierBase = parsed.base;
      } catch (e) {
        console.warn('Failed to parse saved skier from localStorage', e);
      }
    }
    this.load.image('current_skier', `assets/${skierBase}_right.png`);
    this.load.image('radio', `assets/sprites/radio.png`);
  }

  create() {
    // 🔄 Ladda sparade val om de finns
    const storedSkier = JSON.parse(localStorage.getItem('selectedSkier'));
    if (storedSkier) {
      const index = this.skierOptions.findIndex(s => s.base === storedSkier.base);
      if (index !== -1) this.selectedSkierIndex = index;
    }
  
    const storedSong = JSON.parse(localStorage.getItem('selectedSong'));
    if (storedSong) {
      const index = this.musicOptions.findIndex(m => m.file === storedSong.file);
      if (index !== -1) this.selectedSongIndex = index;
    }

    const centerX = this.scale.width / 2;
    const title = this.add.text(centerX, 50, 'SETTINGS', {
        fontSize: '24px',
        fill: '#E34234',
        fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);

      this.skierImage = this.add.sprite(centerX, 130, 'current_skier')
      .setOrigin(0.5)
      .setDisplaySize(100, 150);

      this.skierText = this.add.text(centerX, 200, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#222222'
    }).setOrigin(0.5);

    this.radioImage = this.add.sprite(centerX, 350, 'radio')
      .setOrigin(0.5)
      .setDisplaySize(100, 100);

    this.songText = this.add.text(centerX, 400, '', {
      fontFamily: '"Press Start 2P"',
      fontSize: '12px',
      color: '#222222'
    }).setOrigin(0.5);

    if (isMobile()) {
      this.createMobileButtons();
    } else {
      this.createDesktopInstructions();
      this.setupKeyboardControls();
    }

    this.events.on('shutdown', () => {
    if (this.currentMusic && this.currentMusic.isPlaying) {
        this.currentMusic.stop();
    }
    });

    this.updateDisplay();
  }

  createMobileButtons() {
    const centerX = this.scale.width / 2;
    const bottom = this.scale.height;

    createButton(this, centerX, 240, 'Change Skier', () => {
      this.changeSelection('skier');
    });

    createButton(this, centerX, 440, 'Change Song', () => {
      this.changeSelection('song');
    });

    createButton(this, centerX, bottom - 80, 'Back', () => {
      this.saveSelection();
      this.scene.start('StartScene');
    }, { color: 0xe34234 });
  }

  createDesktopInstructions() {
    const centerX = this.scale.width / 2;
    this.add.text(centerX, this.scale.height - 40,
      '↑↓ Switch Field   ←→ Change Option   ESC to Go Back', {
        fontSize: '10px',
        fill: '#222222',
        fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);
  }

  setupKeyboardControls() {
    this.input.keyboard.on('keydown-UP', () => {
      this.currentSelection = 'skier';
      this.updateDisplay();
    });
    this.input.keyboard.on('keydown-DOWN', () => {
      this.currentSelection = 'song';
      this.updateDisplay();
    });
    this.input.keyboard.on('keydown-LEFT', () => {
      this.changeOption(-1);
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.changeOption(1);
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.saveSelection();
      this.scene.start('StartScene');
    });
  }

  changeSelection(field) {
    this.currentSelection = field;
    this.changeOption(1);
  }

  changeOption(direction) {
    if (this.currentSelection === 'skier') {
      this.selectedSkierIndex = (this.selectedSkierIndex + direction + this.skierOptions.length) % this.skierOptions.length;
      const skier = this.skierOptions[this.selectedSkierIndex];
  
      // Ta bort gammal texture
      this.skierImage.setVisible(false);
      if (this.textures.exists('current_skier')) {
        this.textures.remove('current_skier');
      }
  
      // Ladda 
      this.load.image('current_skier', `assets/${skier.base}_right.png`);
      this.load.once('complete', () => {
        this.skierImage.setTexture('current_skier');
        this.skierImage.setVisible(true);
        this.updateDisplay();
      });
      this.load.start();
    } else {
        this.selectedSongIndex = (this.selectedSongIndex + direction + this.musicOptions.length) % this.musicOptions.length;
        const song = this.musicOptions[this.selectedSongIndex];
      
        // Stop anything currenty playing (could be normal background music or gameplay music)
        const startMusic = this.sound.get('music_start');
        if (startMusic && startMusic.isPlaying) {
            startMusic.stop();
        }
        if (this.currentMusic && this.currentMusic.isPlaying) {
          this.currentMusic.stop();
        }
      
        // Ladda och spela ny musik
        if (!this.sound.get(song.file)) {
          this.load.audio(song.file, `assets/${song.file}`);
          this.load.once('complete', () => {
            this.currentMusic = this.sound.add(song.file, { loop: true, volume: 0.5 });
            this.currentMusic.play();
          });
          this.load.start();
        } else {
          this.currentMusic = this.sound.add(song.file, { loop: true, volume: 0.5 });
          this.currentMusic.play();
        }
      
        this.updateDisplay();
      }
  }

  updateDisplay() {
    const skier = this.skierOptions[this.selectedSkierIndex];
    const song = this.musicOptions[this.selectedSongIndex];
    this.skierText.setText(`${skier.name}`);
    this.songText.setText(`${song.name}`);
  }

  saveSelection() {
    const skier = this.skierOptions[this.selectedSkierIndex];
    const song = this.musicOptions[this.selectedSongIndex];
    localStorage.setItem('selectedSkier', JSON.stringify(skier));
    localStorage.setItem('selectedSong', JSON.stringify(song));
  }
}
