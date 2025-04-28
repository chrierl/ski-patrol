// TouchControls.js

export function addTouchControlGrid(scene, layoutConfig = {}) {
    if (!scene.touchControls) {
      scene.touchControls = scene.add.group();
    }
  
    const screenW = scene.scale.width;
    const screenH = scene.scale.height;
  
    const areaWidthPercent = layoutConfig.controlWidthPercent || 1.0;
    const areaHeightPercent = layoutConfig.controlHeightPercent || 1.0;
    const verticalOffset = layoutConfig.verticalOffset || 0;
    const transparency = layoutConfig.alpha || 0.05;
  
    const colPercents = layoutConfig.columns || [0.33, 0.34, 0.33];
    const rowPercents = layoutConfig.rows || [0.33, 0.34, 0.33];
  
    const areaW = screenW * areaWidthPercent;
    const areaH = screenH * areaHeightPercent;
    const areaLeft = (screenW - areaW) / 2;
    const areaTop = screenH - areaH - verticalOffset;
  
    const zoneW = colPercents.map(p => areaW * p);
    const zoneH = rowPercents.map(p => areaH * p);
  
    const labels = [
      ['↖', '↑', '↗'],
      ['←', '⏺', '→'],
      ['↙', '↓', '↘']
    ];
  
    const actions = [
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 1.5; scene.scrollSpeedY = Math.max(scene.minSpeed, scene.scrollSpeedY - 1); } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 0; scene.scrollSpeedY = Math.max(scene.minSpeed, scene.scrollSpeedY - 1); } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = -1.5; scene.scrollSpeedY = Math.max(scene.minSpeed, scene.scrollSpeedY - 1); } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 1.5; } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 0; } },  // <--- CENTER BUTTON (stop steering left/right)
      () => { if (!scene.gamePaused) { scene.lateralSpeed = -1.5; } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 1.5; scene.scrollSpeedY = Math.min(scene.maxSpeed, scene.scrollSpeedY + 1); } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = 0; scene.scrollSpeedY = Math.min(scene.maxSpeed, scene.scrollSpeedY + 1); } },
      () => { if (!scene.gamePaused) { scene.lateralSpeed = -1.5; scene.scrollSpeedY = Math.min(scene.maxSpeed, scene.scrollSpeedY + 1); } },
    ];
  
    let startX = areaLeft;
    for (let col = 0; col < 3; col++) {
      let startY = areaTop;
      for (let row = 0; row < 3; row++) {
        const width = zoneW[col];
        const height = zoneH[row];
  
        const bg = scene.add.rectangle(startX + width / 2, startY + height / 2, width, height, 0x000000, transparency)
          .setOrigin(0.5)
          .setDepth(1000)
          .setInteractive({ useHandCursor: false });
        scene.touchControls.add(bg);
  
        const label = scene.add.text(startX + width / 2, startY + height / 2, labels[row][col], {
          fontSize: `${Math.floor(height * 0.4)}px`,
          fill: '#ffffff',
          fontFamily: '"Press Start 2P"'
        }).setOrigin(0.5).setAlpha(0.2).setDepth(1001);
        scene.touchControls.add(label);
  
        const index = row * 3 + col; 
        bg.on('pointerdown', (pointer) => { if (!scene.gamePaused) actions[index](); });          
        bg.on('pointerover', (pointer) => { if (pointer.isDown && !scene.gamePaused) actions[index]();  });

        startY += height;
      }
      startX += zoneW[col];
    }
  }