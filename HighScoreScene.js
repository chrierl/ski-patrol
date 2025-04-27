import { highScoreManager } from './game.js';
import { isMobile, createButton } from './helpers.js';

export default class HighScoreScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HighScoreScene' });
    this.showingGlobal = false;
  }

  async create() {
    this.highscoreTexts = [];
    this.categories = [
      { key: 'distance', label: 'Meters Skied' },
      { key: 'time', label: 'Time Survived' },
      { key: 'items', label: 'Items Collected' }
    ];

    this.localScores = {};
    this.globalScores = {};

    for (const cat of this.categories) {
      this.localScores[cat.key] = highScoreManager.getLocalHighScores(cat.key);
      this.globalScores[cat.key] = await highScoreManager.getGlobalHighScores(cat.key);
    }

    this.drawHighscoreText();

    if (isMobile()) {
      this.createMobileButtons();
    } else {
      this.input.keyboard.on('keydown-LEFT', () => {
        this.showingGlobal = false;
        this.drawHighscoreText();
      });
      this.input.keyboard.on('keydown-RIGHT', () => {
        this.showingGlobal = true;
        this.drawHighscoreText();
      });
      this.input.keyboard.once('keydown-ESC', () => {
        this.scene.start('StartScene');
      });
    }
  }

  drawHighscoreText() {
    this.highscoreTexts.forEach(t => t.destroy());
    this.highscoreTexts = [];
    const width = this.scale.width;
    const height = this.scale.height;
  
    const title = this.add.text(width / 2, 80, 'HIGH SCORES', {
      fontSize: '24px',
      fill: '#E34234',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
    this.highscoreTexts.push(title);
  
    const labelLocal = this.add.text(width / 2 - 100, 130, 'LOCAL', {
      fontSize: '14px',
      fill: this.showingGlobal ? '#888' : '#E34234',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
    const labelGlobal = this.add.text(width / 2 + 100, 130, 'GLOBAL', {
      fontSize: '14px',
      fill: this.showingGlobal ? '#E34234' : '#888',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  
    this.highscoreTexts.push(labelLocal, labelGlobal);
  
    const isMobileDevice = isMobile();
  
    this.categories.forEach((cat, index) => {
      const scores = this.showingGlobal
        ? this.globalScores[cat.key] || []
        : this.localScores[cat.key] || [];
    
      if (!isMobileDevice) {
        // Desktop = horizontal layout
        const x = (width / 2) + (index - 1) * 300;
        const y = 160;
        this.drawScoreList(cat.label, scores, x, y);
      } else {
        // Mobile = vertical layout
        const x = width / 2;
        const y = 160 + index * 200;
        this.drawScoreList(cat.label, scores, x, y);
      }
    });
  
    if (!isMobileDevice) {
      const continueText = this.add.text(width / 2, this.scale.height - 80, 'PRESS ESC TO RETURN', {
        fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);
      this.highscoreTexts.push(continueText);
      const switchText = this.add.text(width / 2, this.scale.height - 30, 'USER LEFT/RIGHT ARROWS TO SWITCH HIGHSCORE LIST', {
        fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);
      this.highscoreTexts.push(switchText);
    }
  }

  drawScoreList(categoryLabel, scores, startX, startY) {
    const title = this.add.text(startX, startY, categoryLabel, {
      fontSize: '12px', fill: '#020202', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
  
    this.highscoreTexts.push(title);
  
    scores.forEach((entry, i) => {
      const rank = `${i + 1}.`.padStart(4, ' ');
      const name = (entry.name || '---').padEnd(12, ' ');
      const val = String(entry.value ?? '').padStart(5, ' ');
      const text = `${rank} ${name} ${val}`;
      
      const y = startY + 20 + i * 16;
  
      const scoreText = this.add.text(startX, y, text, {
        fontSize: '10px', fill: '#020202', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5, 0.5).setAlpha(0);
  
      this.tweens.add({
        targets: scoreText,
        alpha: 1,
        duration: 500,
        delay: i * 50
      });
  
      this.highscoreTexts.push(scoreText);
    });
  }
  
  createMobileButtons() {
    const width = this.scale.width;
    const height = this.scale.height;
    const buttonOptions = { backgroundColor: 0x008000, textColor: '#ffffff' };

    // Byt mellan lokal/global
    this.viewSwitchButton = createButton(
      this,
      width / 2 - 100,
      height - 50,
      this.showingGlobal ? 'View Local' : 'View Global',
      () => {
        this.showingGlobal = !this.showingGlobal;
        this.drawHighscoreText();
        this.updateMobileButtonLabels();
      },
      buttonOptions
    );

    // Exit
    this.exitButton = createButton(
      this,
      width / 2 + 100,
      height - 50,
      'Exit',
      () => {
        this.scene.start('StartScene');
      },
      buttonOptions
    );
  }

  updateMobileButtonLabels() {
    if (this.viewSwitchButton?.text) {
      this.viewSwitchButton.text.setText(this.showingGlobal ? 'View Local' : 'View Global');
    }
  }
}