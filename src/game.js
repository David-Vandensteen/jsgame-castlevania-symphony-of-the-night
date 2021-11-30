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

  scene(gameConfig) {
    this.k.scene('game', () => {
      this.k.gravity(gameConfig.gravity);

      level.add()
        .play();

      player.add()
        .registerStates()
        .registerKeys()
        .onAnimEnd()
        .richter.stateIdle('standA');

      player.whip.stateIdle();
      player.onUpdate(level);
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
