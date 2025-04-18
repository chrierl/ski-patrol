export const objectConfigs = [
    {
      type: 'obstacle',
      sprite: 'tree',
      weight: 30,
      scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.3, y: 0.65, width: 0.4, height: 0.30 },
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'rock',
      weight: 8,
      scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
      hitbox: { x: 0.25, y: 0.5, width: 0.5, height: 0.3 },
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'snowman',
      weight: 4,
      scale: () => 0.12,
      hitbox: { x: 0.3, y: 0.4, width: 0.4, height: 0.5 },
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'groomer',
      weight: 1,
      scale: () => 0.20,
      hitbox: { x: 0.05, y: 0.5, width: 0.9, height: 0.25 },
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'simon',
      weight: 1,
      scale: () => 0.08,
      hitbox: { x: 0.2, y: 0.5, width: 0.6, height: 0.5 },
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox
        };
      }
    },
    {
      type: 'collectible',
      sprite: 'bottle',
      weight: 4,
      scale: () => 0.04,
      points: 2,
      timeBonus: 2000,
      hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 },
      rotation: 50,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          points: this.points,
          timeBonus: this.timeBonus,
          rotation: this.rotation
        };
      }
    },
    {
      type: 'collectible',
      sprite: 'pole',
      weight: 2,
      scale: () => 0.04,
      points: 3,
      timeBonus: 2000,
      hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 },
      rotation: 120,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          points: this.points,
          timeBonus: this.timeBonus,
          rotation: this.rotation
        };
      }
    },
    {
      type: 'collectible',
      sprite: 'can',
      weight: 8,
      scale: () => 0.04,
      points: 1,
      timeBonus: 1000,
      hitbox: { x: 0.15, y: 0.15, width: 0.3, height: 0.4 },
      rotation: 60,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          points: this.points,
          timeBonus: this.timeBonus,
          rotation: this.rotation
        };
      }
    }
  ];
  
export function weightedPick(items) {
    const weighted = [];
    items.forEach(item => {
      for (let i = 0; i < (item.weight || 1); i++) {
        weighted.push(item);
      }
    });
    return Phaser.Math.RND.pick(weighted);
}

