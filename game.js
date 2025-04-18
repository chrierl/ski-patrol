import { StartScene } from './StartScene.js';
import { MainScene } from './MainScene.js';
import { HighScoreScene } from './HighScoreScene.js';

export const config = {
  type: Phaser.AUTO,
  backgroundColor: '#FFF5EE',
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 200 }, debug: false }
  },
  scene: [StartScene, MainScene, HighScoreScene]
};

// ✅ Kör spelet direkt, utan att vänta på font-laddning
new Phaser.Game(config);