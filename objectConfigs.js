export const objectConfigs = [
    {
      type: 'obstacle',
      sprite: 'tree',
      weight: 20,
      scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.35, y: 0.60, width: 0.3, height: 0.35 },
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
      weight: 15,
      scale: () => Phaser.Math.FloatBetween(0.10, 0.25),
      hitbox: { x: 0.35, y: 0.70, width: 0.3, height: 0.25 },
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
      weight: 10,
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
      weight: 8,
      scale: () => Phaser.Math.FloatBetween(0.08, 0.12),
      hitbox: { x: 0.25, y: 0.57, width: 0.50, height: 0.2 },
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
      sprite: 'cabin',
      weight: 2,
      scale: () => 0.25,
      hitbox: { x: 0.1, y: 0.6, width: 0.8, height: 0.3 },
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
      sprite: 'reindeer',
      weight: 2,
      scale: () => 0.14,
      hitbox: { x: 0.20, y: 0.5, width: 0.50, height: 0.4 },
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
      weight: 1,
      scale: () => 0.12,
      hitbox: { x: 0.3, y: 0.55, width: 0.4, height: 0.35 },
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
      sprite: 'groomer',
      weight: 1,
      scale: () => 0.20,
      hitbox: { x: 0.08, y: 0.6, width: 0.87, height: 0.15 },
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
      sprite: 'snowmobile_yellow',
      weight: 1,
      scale: () => 0.15,
      hitbox: { x: 0.15, y: 0.5, width: 0.7, height: 0.20 },
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
      sprite: 'snowmobile_red',
      weight: 1,
      scale: () => 0.15,
      hitbox: { x: 0.15, y: 0.5, width: 0.7, height: 0.20 },
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
      weight: 7,
      scale: () => 0.04,
      points: 2,
      timeBonus: 2000,
      hitbox: { x: 0.20, y: 0.2, width: 0.6, height: 0.6 },
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
      weight: 1,
      scale: () => 0.04,
      points: 2,
      timeBonus: 2000,
      hitbox: { x: 0.3, y: 0.3, width: 0.4, height: 0.4 },
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
      sprite: 'ski_pass',
      weight: 3,
      scale: () => 0.04,
      points: 2,
      timeBonus: 2000,
      hitbox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
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
      sprite: 'mobile',
      weight: 1,
      scale: () => 0.05,
      points: 3,
      timeBonus: 3000,
      hitbox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
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
      weight: 12,
      scale: () => 0.04,
      points: 1,
      timeBonus: 1000,
      hitbox: { x: 0.2, y: 0.2, width: 0.6, height: 0.6 },
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
        scale: Phaser.Math.FloatBetween(0.07, 0.12),
        speed: Phaser.Math.Between(2, 5),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'chopper',
      weight: 3,
      config: () => ({
        scale: Phaser.Math.FloatBetween(0.3, 0.45),
        speed: Phaser.Math.Between(2, 5),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'hang_glider',
      weight: 2,
      config: () => ({
        scale: Phaser.Math.FloatBetween(0.20, 0.5),
        speed: Phaser.Math.Between(1, 3),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'hang_glider_sp',
      weight: 3,
      config: () => ({
        scale: Phaser.Math.FloatBetween(0.20, 0.5),
        speed: Phaser.Math.Between(1, 3),
        direction: Math.random() < 0.5 ? 'left' : 'right',
        y: Phaser.Math.Between(100, 300),
      })
    },
    {
      type: 'ambient',
      sprite: 'fog',
      weight: 3,
      config: () => ({
        scale: Phaser.Math.FloatBetween(0.75, 0.9),
        speed: Phaser.Math.Between(1, 2),
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

