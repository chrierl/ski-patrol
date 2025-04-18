export function addTouchControls(scene) {
    const screenW = scene.scale.width;
    const screenH = scene.scale.height;
  
    const sizeW = screenW * 0.15;
    const sizeH = screenH * 0.15;
    const size = Math.min(sizeW, sizeH);
    const margin = 20;
  
    const style = {
      fontSize: `${size * 0.5}px`,
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"',
      align: 'center'
    };
  
    scene.touchLeft = false;
    scene.touchRight = false;
  
    const createButton = (x, y, label, onDown, onUp = () => {}) => {
      const bg = scene.add.rectangle(x, y, size, size, 0x000000, 0.4)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff)
        .setDepth(1000);
      const text = scene.add.text(x, y, label, style)
        .setOrigin(0.5)
        .setDepth(1001);
  
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerdown', onDown);
      bg.on('pointerup', onUp);
  
      return { bg, text };
    };
  
    const xLeft = margin + size / 2;
    const safeBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0;
    const yDown = screenH - margin - size / 2 - safeBottom;
  
    createButton(xLeft, yDown - size - margin, '↑', () => {
      scene.scrollSpeedY = Math.max(scene.minSpeed, scene.scrollSpeedY - 1);
    });
  
    createButton(xLeft, yDown, '↓', () => {
      scene.scrollSpeedY = Math.min(scene.maxSpeed, scene.scrollSpeedY + 1);
    });
  
    const yControls = yDown;
    const xRight = screenW - margin - size / 2;
    const xLeftControl = xRight - size - margin;
  
    createButton(xLeftControl, yControls, '<',
      () => { scene.touchLeft = true; },
      () => { scene.touchLeft = false; });
  
    createButton(xRight, yControls, '>',
      () => { scene.touchRight = true; },
      () => { scene.touchRight = false; });
  
    scene.input.on('pointerup', () => {
      scene.touchLeft = false;
      scene.touchRight = false;
    });
  }