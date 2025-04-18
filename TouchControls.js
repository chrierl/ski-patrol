// TouchControls.js

export function addTouchControls(scene) {
    const btnSize = scene.scale.height * 0.30;
    const padding = 20;
  
    const makeButton = (label, x, y, flag) => {
      const bg = scene.add.rectangle(x, y, btnSize, btnSize, 0x000000, 0.3)
        .setOrigin(0.5)
        .setInteractive()
        .setScrollFactor(0)
        .setDepth(2000);
  
      const text = scene.add.text(x, y, label, {
        fontSize: `${btnSize * 0.4}px`,
        color: '#ffffff',
        fontFamily: 'Press Start 2P'
      }).setOrigin(0.5).setDepth(2001);
  
      bg.on('pointerdown', () => scene.inputFlags[flag] = true);
      bg.on('pointerup', () => scene.inputFlags[flag] = false);
      bg.on('pointerout', () => scene.inputFlags[flag] = false);
    };
  
    scene.inputFlags = {};
  
    const w = scene.scale.width;
    const h = scene.scale.height;
  
    makeButton('⏫', padding + btnSize / 2, h - btnSize * 2.2, 'speedUp');
    makeButton('⏬', padding + btnSize / 2, h - btnSize, 'slowDown');
    makeButton('⬅️', w - padding - btnSize * 1.5, h - btnSize * 1.6, 'left');
    makeButton('➡️', w - padding - btnSize * 0.5, h - btnSize * 1.6, 'right');
  }
  