// Various helpful functions to be reused across the program

export function isMobile() {
    return /Mobi|Android/i.test(navigator.userAgent);
  }
  
export function formatTime(ms) {
    return (ms / 1000).toFixed(1) + 's';
}
  