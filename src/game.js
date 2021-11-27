/* eslint-disable no-param-reassign */

import kaboom from 'kaboom';
import playerConfig from './config/asset/player';
import backgroundConfig from './config/asset/background';
import { playerRegisterAnimEnd, playerRegisterKeys, playerRegisterStates } from './lib/player';

class Game {
  loadAssets() {
    this.k.loadSprite('background', backgroundConfig.asset);
    this.k.loadSprite('player', playerConfig.asset, playerConfig.sprite);
    this.k.loadSound('music', 'sound/music.mp3');
    return this;
  }

  computeMove(player, background, screenMiddle) {
    const { isDirectionLeft, isDirectionRight } = player.states;
    if (isDirectionRight() && player.pos.x > screenMiddle) {
      player.pos.x = screenMiddle;
      background.move(-player.config.speed, 0);
    }

    if (isDirectionLeft() && player.pos.x < screenMiddle && background.pos.x < 0) {
      player.pos.x = screenMiddle;
      background.move(player.config.speed, 0);
    }
    if (player.pos.x < 75) player.pos.x = 75;
    if (background.pos.x > background.config.limits.left) background.pos.x = 0;
    if (background.pos.x < background.config.limits.right) {
      background.pos.x = background.config.limits.right;
    }
    return this;
  }

  scene(gameConfig) {
    this.k.scene('game', () => {
      this.k.gravity(gameConfig.gravity);

      const background = this.k.add([
        this.k.sprite('background'),
        this.k.pos(0, 0), {
          config: backgroundConfig,
        },
      ]);

      const player = this.k.add([
        this.k.sprite('player', {
          animSpeed: playerConfig.animSpeed,
        }),
        this.k.pos(100, 100),
        this.k.area(),
        this.k.body(), {
          config: playerConfig,
        },
      ]);
      // floor
      this.k.add([
        this.k.rect(this.k.width(), 24),
        this.k.area(),
        this.k.pos(0, 187),
        this.k.solid(),
        this.k.opacity(0),
      ]);

      playerRegisterStates(player);
      player.stateIdle('standA');

      this.k.focus();

      playerRegisterAnimEnd(player);
      playerRegisterKeys(player, this.k);

      this.k.play('music', {
        loop: true,
      });

      player.onUpdate(() => {
        this.computeMove(player, background, this.k.center().x);
      });
    });
    return this;
  }

  start(kaboomConfig, gameConfig, assetConfig) {
    this.k = kaboom(kaboomConfig);
    this.k.loadRoot(assetConfig.root);

    this.loadAssets()
      .scene(gameConfig);

    this.k.go('game');
    return this;
  }
}

export default (kaboomConfig, gameConfig, assetConfig) => {
  const game = new Game();
  return game.start(kaboomConfig, gameConfig, assetConfig);
};
