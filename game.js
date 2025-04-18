// game.js
import StartScene from './StartScene.js';
import MainScene from './MainScene.js';
import HighScoreScene from './HighScoreScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#fff5ee',
  width: window.innerWidth,
  height: window.innerHeight,
  parent: 'game-container',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 },
      debug: false
    }
  },
  scene: [StartScene, MainScene, HighScoreScene],
  scale: {
    mode: Phaser.Scale.NONE, // inget autoscale – vi kör raw
    autoCenter: Phaser.Scale.NO_CENTER
  }
};

export default config;