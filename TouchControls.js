export function addTouchControls(scene) {
    const screenW = scene.scale.width;
    const screenH = scene.scale.height;
  
    const size = Math.min(screenW, screenH) * 0.12;
    const gap = size * 0.2;
    const totalWidth = size * 3 + gap * 2;
    const totalHeight = size * 3 + gap * 2;
  
    const startX = (screenW - totalWidth) / 2;
    const startY = screenH - totalHeight - 20;
  
    const style = {
      fontSize: `${size * 0.4}px`,
      fill: '#ffffff',
      fontFamily: '"Press Start 2P"',
      align: 'center'
    };
  
    const buttonAreas = [];
  
    const createButton = (col, row, label, direction, speedChange) => {
      const x = startX + col * (size + gap) + size / 2;
      const y = startY + row * (size + gap) + size / 2;
  
      scene.add.rectangle(x, y, size, size, 0x000000, 0.4)
        .setOrigin(0.5)
        .setStrokeStyle(2, 0xffffff)
        .setDepth(1000);
      scene.add.text(x, y, label, style)
        .setOrigin(0.5)
        .setDepth(1001);
  
      // Save button area for pointer tracking
      buttonAreas.push({
        rect: new Phaser.Geom.Rectangle(x - size/2, y - size/2, size, size),
        direction,
        speedChange
      });
    };
  
    // Grid: row (Y), col (X)
    createButton(0, 0, '↖', -1, -1);
    createButton(1, 0, '↑',  0, -1);
    createButton(2, 0, '↗',  1, -1);
  
    createButton(0, 1, '←', -1,  0);
    createButton(1, 1, '•',  0,  0);
    createButton(2, 1, '→',  1,  0);
  
    createButton(0, 2, '↙', -1,  1);
    createButton(1, 2, '↓',  0,  1);
    createButton(2, 2, '↘',  1,  1);
  
    // 🧠 Handle pointer drag movement
    scene.input.on('pointermove', pointer => {
      if (!pointer.isDown) return;
      const x = pointer.x;
      const y = pointer.y;
  
      let matched = false;
      for (const btn of buttonAreas) {
        if (Phaser.Geom.Rectangle.Contains(btn.rect, x, y)) {
          scene.touchDirection = btn.direction;
          scene.touchSpeedChange = btn.speedChange;
          matched = true;
          break;
        }
      }
  
      if (!matched) {
        scene.touchDirection = 0;
        scene.touchSpeedChange = 0;
      }
    });
  
    // 🧤 When finger lifted
    scene.input.on('pointerup', () => {
      scene.touchDirection = 0;
      scene.touchSpeedChange = 0;
    });
  }