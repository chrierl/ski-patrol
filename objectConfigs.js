export const objectConfigs = [
    {
      type: 'obstacle',
      sprite: 'tree',
      weight: 20,
      scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.3, y: 0.50, width: 0.4, height: 0.35 },
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'tree_snowy',
      weight: 10,
      scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.3, y: 0.50, width: 0.4, height: 0.35 },
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'rock',
      weight: 5,
      scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
      hitbox: { x: 0.25, y: 0.5, width: 0.5, height: 0.3 },
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'rock_narrow',
      weight: 3,
      scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
      hitbox: { x: 0.30, y: 0.4, width: 0.4, height: 0.4 },
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
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
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
        };
      }
    },
    {
      type: 'obstacle',
      sprite: 'simon',
      weight: 1,
      scale: () => 0.08,
      hitbox: { x: 0.2, y: 0.5, width: 0.6, height: 0.5 },
      mirror: true,
      config() {
        return {
          sprite: this.sprite,
          scale: this.scale(),
          hitbox: this.hitbox,
          mirror: this.mirror
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
    },
    {
      type: 'ambient',
      sprite: 'bird',
      weight: 10,
      config: () => ({
        scale: 0.08,
        speed: Phaser.Math.Between(2, 5),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'chopper',
      weight: 2,
      config: () => ({
        scale: 0.30,
        speed: Phaser.Math.Between(2, 5),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'hang_glider',
      weight: 5,
      config: () => ({
        scale: 0.25,
        speed: Phaser.Math.Between(1, 3),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    }
  ];
  
  export function weightedPick(items) {
    const totalWeight = items.reduce((sum, item) => sum + (item.weight || 1), 0);
    let roll = Phaser.Math.FloatBetween(0, totalWeight);
    for (const item of items) {
      roll -= item.weight || 1;
      if (roll <= 0) {
        return item;
      }
    }
    return items[items.length - 1];
  }

