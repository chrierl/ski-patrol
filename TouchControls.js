// TouchControls.js
export function addTouchControls(scene) {
    const width = scene.scale.width;
    const height = scene.scale.height;
  
    const buttonSize = 64;
    const padding = 20;
  
    // === FART ===
    const upButton = scene.add.rectangle(
      padding + buttonSize / 2,
      height - padding - buttonSize * 1.5,
      buttonSize,
      buttonSize,
      0xE34234
    ).setScrollFactor(0).setInteractive();
    const downButton = scene.add.rectangle(
      padding + buttonSize / 2,
      height - padding - buttonSize / 2,
      buttonSize,
      buttonSize,
      0xE34234
    ).setScrollFactor(0).setInteractive();
  
    const upText = scene.add.text(upButton.x, upButton.y, '⏫', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5);
    const downText = scene.add.text(downButton.x, downButton.y, '⏬', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5);
  
    upButton.on('pointerdown', () => {
      scene.scrollSpeedY = Math.max(scene.minSpeed, scene.scrollSpeedY - 1);
    });
    downButton.on('pointerdown', () => {
      scene.scrollSpeedY = Math.min(scene.maxSpeed, scene.scrollSpeedY + 1);
    });
  
    // === STYRNING ===
    const rightButton = scene.add.rectangle(
      width - padding - buttonSize / 2,
      height - padding - buttonSize / 2,
      buttonSize,
      buttonSize,
      0xE34234
    ).setScrollFactor(0).setInteractive();
    const leftButton = scene.add.rectangle(
      width - padding - buttonSize * 1.5,
      height - padding - buttonSize / 2,
      buttonSize,
      buttonSize,
      0xE34234
    ).setScrollFactor(0).setInteractive();
  
    const rightText = scene.add.text(rightButton.x, rightButton.y, '➡️', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5);
    const leftText = scene.add.text(leftButton.x, leftButton.y, '⬅️', {
      fontSize: '32px', color: '#ffffff', fontFamily: 'Arial'
    }).setOrigin(0.5);
  
    rightButton.on('pointerdown', () => {
      scene.inputFlags.right = true;
    });
    leftButton.on('pointerdown', () => {
      scene.inputFlags.left = true;
    });
  
    rightButton.on('pointerup', () => {
      scene.inputFlags.right = false;
    });
    leftButton.on('pointerup', () => {
      scene.inputFlags.left = false;
    });
  
    // Gör även detta för touch utanför knapparna
    scene.inputFlags = { left: false, right: false };
  }
  