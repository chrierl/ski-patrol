const gameSettings = {
    minSpeed: 2,
    maxSpeed: 10,
    startSpeed: 2,
    timeFromStart: 30 * 1000,
    obstacleSpawnChance: 0.07,
    collectibleSpawnChance: 0.05,
    referenceWidth: 680, // The width that the spawn frequency is based on. Scale for other screen widths
    minCrashFreeze: 1 * 1000, // Freeze time when crashing at min speed
    maxCrashFreeze: 1 * 4000, // ...and time when crashing at max speed 
    invincibilityTime: 5000
};
  
  export default gameSettings;