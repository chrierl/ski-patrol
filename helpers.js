// Various helpful functions to be reused across the program

export function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }
  
export function formatTime(ms) {
    return (ms / 1000).toFixed(1) + 's';
}
  
export function createButton(scene, x, y, label, onClick, options = {}) {
    const width = options.width || 200;
    const height = options.height || 50;
    const backgroundColor = options.backgroundColor || 0x00aa00; // Grön
    const textColor = options.textColor || '#ffffff';

    const button = scene.add.rectangle(x, y, width, height, backgroundColor)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(2, 0xffffff)
      .setDepth(2000);
    
    const buttonText = scene.add.text(x, y, label, {
      fontFamily: '"Press Start 2P"',
      fontSize: '14px',
      color: textColor,
      align: 'center'
    }).setOrigin(0.5)
      .setDepth(2001);

    button.on('pointerdown', onClick);

    return { button, buttonText };
}