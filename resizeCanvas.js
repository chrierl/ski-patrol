export function resizeCanvas() {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }
  }