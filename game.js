// game.js
import StartScene from './StartScene.js';
import MainScene from './MainScene.js';
import HighScoreScene from './HighScoreScene.js';

export const config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#FFF5EE',
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: [StartScene, MainScene, HighScoreScene],
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};