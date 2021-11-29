/* eslint-disable no-param-reassign */

import kaboom from 'kaboom';
import playerConfig from './config/asset/player';
import levelConfig from './config/asset/level';
import player from './lib/player';
import level from './lib/level';

class Game {
  load() {
    level.load();
    player.load();
    return this;
  }

  computeMove({ richter }, background, screenMiddle) {
    const { isDirectionLeft, isDirectionRight } = richter.states;
    if (isDirectionRight() && richter.pos.x > screenMiddle) {
      richter.pos.x = screenMiddle;
      background.move(-richter.config.speed, 0);
    }

    if (isDirectionLeft() && richter.pos.x < screenMiddle && background.pos.x < 0) {
      richter.pos.x = screenMiddle;
      background.move(richter.config.speed, 0);
    }
    if (richter.pos.x < 75) richter.pos.x = 75;
    if (background.pos.x > background.config.limits.left) background.pos.x = 0;
    if (background.pos.x < background.config.limits.right) {
      background.pos.x = background.config.limits.right;
    }
    return this;
  }

  scene(gameConfig) {
    this.k.scene('game', () => {
      this.k.gravity(gameConfig.gravity);

      level.add()
        .play();

      player.add()
        .registerStates()
        .registerKeys()
        .onAnimEnd()
        .richter.stateIdle('standA')
        .onUpdate(() => {
          this.computeMove(player, level.background, this.k.center().x); // TODO : on player
        });

      player.whip.stateIdle()
        .onUpdate(() => { // TODO : on player
          if (player.whip.opacity) {
            player.whip.pos.x = player.richter.pos.x + 25;
            player.whip.pos.y = player.richter.pos.y - 20;
          }
        });
    });
    this.k.focus();
    return this;
  }

  register(kaboomConfig, gameConfig, assetConfig) {
    this.gameConfig = gameConfig;
    this.k = kaboom(kaboomConfig);
    this.k.loadRoot(assetConfig.root);
    player.register(this.k, playerConfig);
    level.register(this.k, levelConfig);
    return this;
  }

  start() {
    this.load()
      .scene(this.gameConfig);

    this.k.go('game');
    return this;
  }
}

export default (kaboomConfig, gameConfig, assetConfig) => {
  const game = new Game();
  game.register(kaboomConfig, gameConfig, assetConfig);
  return game.start(kaboomConfig, gameConfig, assetConfig);
};
