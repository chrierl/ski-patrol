export function resizeCanvas() {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
  
    const width = window.innerWidth;
    const height = window.visualViewport
      ? window.visualViewport.height
      : window.innerHeight;
  
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
  }