import { highScoreManager } from './game.js';
import { isMobile } from './helpers.js';

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

    // Hämta listor
    this.localScores = {};
    this.globalScores = {};

    for (const cat of this.categories) {
      this.localScores[cat.key] = highScoreManager.getLocalHighScores(cat.key);
      this.globalScores[cat.key] = await highScoreManager.getGlobalHighScores(cat.key);
    }

    this.setupSwitchLabels();
    this.drawHighscoreText();

    this.input.keyboard.on('keydown-LEFT', () => {
      this.showingGlobal = false;
      this.drawHighscoreText();
    });
    this.input.keyboard.on('keydown-RIGHT', () => {
      this.showingGlobal = true;
      this.drawHighscoreText();
    });

    this.input.once('pointerdown', () => {
      this.scene.start('StartScene');
    });
    this.input.keyboard.once('keydown-SPACE', () => {
      this.scene.start('StartScene');
    });
  }

  setupSwitchLabels() {
    const w = this.scale.width;
    const localLabel = this.add.text(w / 2 - 100, 130, 'LOCAL', {
      fontSize: '14px',
      fill: '#888',
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setInteractive();
    const globalLabel = this.add.text(w / 2 + 100, 130, 'GLOBAL', {
      fontSize: '14px',
      fill: '#888',
      fontFamily: '"Press Start 2P"',
    }).setOrigin(0.5).setInteractive();

    this.highscoreTexts.push(localLabel, globalLabel);

    localLabel.on('pointerdown', () => {
      this.showingGlobal = false;
      this.drawHighscoreText();
    });
    globalLabel.on('pointerdown', () => {
      this.showingGlobal = true;
      this.drawHighscoreText();
    });

    this.switchLabels = { localLabel, globalLabel };
  }

  drawHighscoreText() {
    this.highscoreTexts.forEach(t => t.destroy());
    this.highscoreTexts = [];
    const width = this.scale.width;

    const title = this.add.text(width / 2, 80, 'HIGH SCORES', {
      fontSize: '24px',
      fill: '#E34234',
      fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
    this.highscoreTexts.push(title);

    this.setupSwitchLabels();
    this.switchLabels.localLabel.setFill(this.showingGlobal ? '#888' : '#E34234');
    this.switchLabels.globalLabel.setFill(this.showingGlobal ? '#E34234' : '#888');

    let yOffset = 160;

    this.categories.forEach(cat => {
      const scores = this.showingGlobal
        ? this.globalScores[cat.key] || []
        : this.localScores[cat.key] || [];

      const label = this.add.text(width / 2, yOffset, cat.label, {
        fontSize: '12px', fill: '#020202', fontFamily: '"Press Start 2P"'
      }).setOrigin(0.5);
      this.highscoreTexts.push(label);

      scores.forEach((entry, i) => {
        const rank = `${i + 1}.`.padStart(4, ' ');
        const name = (entry.name || '---').padEnd(12, ' ');
        const val = String(entry.value ?? '').padStart(5, ' ');
        const text = `${rank} ${name} ${val}`;
        const estimatedTextWidth = 260; // Justera efter hur lång du tror raden är i pixlar
        const listX = width / 2 - estimatedTextWidth / 2;
        const scoreText = this.add.text(listX, yOffset + 20 + i * 16, text, {
          fontSize: '10px', fill: '#020202', fontFamily: '"Press Start 2P"'
          }).setOrigin(0, 0.5);
        this.highscoreTexts.push(scoreText);
      });

      yOffset += 200;
    });

    const continueText = this.add.text(width / 2, this.scale.height - 30, 'TAP OR PRESS SPACE TO RETURN', {
      fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
    }).setOrigin(0.5);
    this.highscoreTexts.push(continueText);
  }
}