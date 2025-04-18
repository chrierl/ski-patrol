export function resizeCanvas() {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
  
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  }