// HighScoreScene.js
import { config } from './game.js';

class HighScoreScene extends Phaser.Scene {
    constructor() {
      super({ key: 'HighScoreScene' });
    }
  
    init(data) {
      this.runData = data;
      this.displayLists = {};
    }
  
    preload() {}
  
    create() {
      this.highscoreTexts = [];
  
      this.categories = [
        { key: 'distance', label: 'Meters Skied', value: Math.round(this.runData.distance / 20) },
        { key: 'time', label: 'Time Survived', value: parseFloat((this.runData.elapsedTimeMs / 1000).toFixed(1)) },
        { key: 'points', label: 'Points Collected', value: this.runData.score }
      ];
  
      this.placedIn = [];
      this.highscores = {};
  
      this.drawHighscoreText();
    }
  
    drawHighscoreText() {
      this.highscoreTexts.forEach(t => t.destroy());
      this.highscoreTexts = [];
  
      let yStart = 50;

      this.highscoreTexts.push(
        this.add.text(config.width / 2, yStart, 'HIGH SCORES', {
          fontSize: '24px', fill: '#E34234', fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5)
      );
  
      let yOffset = yStart + 30;
  
      this.categories.forEach((cat, index) => {
        const key = `highscore_${cat.key}`;
        const list = JSON.parse(localStorage.getItem(key) || '[]');
        this.highscores[cat.key] = list;
  
        const place = this.getPlacement(list, cat.value);
        if (place < 10) this.placedIn.push(cat);
  
        this.highscoreTexts.push(
          this.add.text(60, yOffset, cat.label, {
            fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
          })
        );
  
        const displayList = [...list];
        if (place < 10 && !this.inputText) {
          displayList.splice(place, 0, { name: '???', value: cat.value });
          displayList.length = 10;
        }
  
        displayList.forEach((entry, i) => {
          const rank = `${i + 1}.`.padStart(4, ' ');
          const name = (entry.name || '---').padEnd(12, ' ');
          const value = String(entry.value).padStart(5, ' ');
          const label = `${rank} ${name} ${value}`;
  
          this.highscoreTexts.push(
            this.add.text(60, yOffset + 20 + i * 16, label, {
              fontSize: '12px', fill: '#020202', fontFamily: '"Press Start 2P"'
            })
          );
        });
  
        yOffset += 210;
      });
  
      if (this.placedIn.length > 0) {
        this.inputText = '';
        this.nameText = this.add.text(config.width / 2, config.height - 40, 'ENTER NAME: ', {
          fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5);
        this.highscoreTexts.push(this.nameText);
  
        this.input.keyboard.on('keydown', (event) => {
          if (event.key === 'Backspace') {
            this.inputText = this.inputText.slice(0, -1);
          } else if (event.key.length === 1 && this.inputText.length < 12) {
            this.inputText += event.key.toUpperCase();
          } else if (event.key === 'Enter' || event.key === ' ') {
            this.saveScores();
            this.showContinuePrompt();
          }
          this.nameText.setText('ENTER NAME: ' + this.inputText);
        });
      } else {
        this.showContinuePrompt();
      }
    }
  
    showContinuePrompt() {
      if (this.nameText) {
        this.nameText.setVisible(false);
      }
  
      this.add.text(config.width / 2, config.height - 40, 'PRESS SPACE TO RETURN', {
        fontSize: '14px', fill: '#020202', fontFamily: '"Press Start 2P"'
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
  
        const entry = { name: this.inputText, value: cat.value };
  
        const existingIndex = list.findIndex(e => e.name === '???' && e.value === cat.value);
        if (existingIndex !== -1) {
          list[existingIndex] = entry;
        } else {
          const place = this.getPlacement(list, cat.value);
          list.splice(place, 0, entry);
        }
  
        if (list.length > 10) list.length = 10;
  
        localStorage.setItem(key, JSON.stringify(list));
      });
  
      this.buildDisplayLists();
    }
  }
  
  export { HighScoreScene };