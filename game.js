import StartScene from './StartScene.js';
import  MainScene from './MainScene.js';
import HighScoreScene from './HighScoreScene.js';

export const config = {
  type: Phaser.AUTO,
  backgroundColor: '#FFF5EE',
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 680,
    height: 800
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: [StartScene, MainScene, HighScoreScene]
};