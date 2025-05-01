// game.js
import StartScene from './StartScene.js';
import MainScene from './MainScene.js';
import HighScoreScene from './HighScoreScene.js';
import HighScoreManager from './HighScoreManager.js';
import SettingsScene from './SettingsScene.js';

const firebaseConfig = {
  apiKey: "AIzaSyA6FN38SHcDWRCk8UYAkZT6nV5tFQuoLac",
  authDomain: "ski-patrol-62b94.firebaseapp.com",
  projectId: "ski-patrol-62b94",
  storageBucket: "ski-patrol-62b94.firebasestorage.app",
  messagingSenderId: "677092678107",
  appId: "1:677092678107:web:2c878b8395f27411e8affe"
};

export const highScoreManager = new HighScoreManager(firebaseConfig, {
  localStoragePrefix: 'highscore_',
  globalStoragePrefix: 'highscores',
  maxEntries: 10
});


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
  scene: [StartScene, MainScene, HighScoreScene, SettingsScene],
  scale: {
    mode: Phaser.Scale.NONE, // inget autoscale – vi kör raw
    autoCenter: Phaser.Scale.NO_CENTER
  }
};

export default config;