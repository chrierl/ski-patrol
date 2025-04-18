// game.js
import StartScene from './StartScene.js';
import MainScene from './MainScene.js';
import HighScoreScene from './HighScoreScene.js';

const config = {
  type: Phaser.AUTO,
  backgroundColor: '#FFF5EE',
  scene: [StartScene, MainScene, HighScoreScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight
  }
};

export default config;