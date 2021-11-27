/* eslint-disable no-param-reassign */

import kaboom from 'kaboom';
import playerConfig from './config/asset/player';
import backgroundConfig from './config/asset/background';

class Game {
  loadAssets() {
    this.k.loadSprite('background', backgroundConfig.asset);
    this.k.loadSprite('player', playerConfig.asset, playerConfig.sprite);
    this.k.loadSound('music', 'sound/music.mp3');
    return this;
  }

  registerKey(player) {
    const move = (direction) => {
      player.direction = direction;
      if (direction === 'left' && player.curAnim() !== 'whip') {
        player.flipX(true);
        player.move(-player.config.speed, 0);
      } else if (direction === 'right' && player.curAnim() !== 'whip') {
        player.flipX(false);
        player.move(player.config.speed, 0);
      }
      player.config.idleLoop.current = 0;
      if (
        player.curAnim() !== 'walk'
        && player.curAnim() !== 'jump'
        && player.curAnim() !== 'whip'
      ) player.play('walk');
    };

    this.k.onKeyDown('left', () => {
      if (player.curAnim() !== 'crouchA' && player.curAnim() !== 'crouchB') move('left');
    });

    this.k.onKeyDown('right', () => {
      if (player.curAnim() !== 'crouchA' && player.curAnim() !== 'crouchB') move('right');
    });

    this.k.onKeyRelease('left', () => {
      if (player.curAnim() !== 'jump') player.play('standA');
    });

    this.k.onKeyRelease('right', () => {
      if (player.curAnim() !== 'jump') player.play('standA');
    });

    this.k.onKeyDown('up', () => {
      if (player.isGrounded()) {
        player.play('jump');
        player.jump(player.config.jump);
      }
    });

    this.k.onKeyPress('down', () => {
      player.play('crouchA');
    });

    this.k.onKeyRelease('down', () => {
      player.play('crouchB');
    });

    this.k.onKeyDown('space', () => {
      if (player.curAnim() !== 'whip') player.play('whip');
    });
    return this;
  }

  registerPlayerAnimEnd(player) {
    player.onAnimEnd('standA', () => {
      if (player.config.idleLoop.current >= player.config.idleLoop.max) {
        player.config.idleLoop.current = 0;
        player.play('standB');
      } else {
        player.config.idleLoop.current += 1;
        player.play('standA');
      }
    });

    player.onAnimEnd('crouchB', () => {
      player.play('standA');
    });

    player.onAnimEnd('jump', () => {
      player.play('standA');
    });

    player.onAnimEnd('whip', () => {
      player.play('standA');
    });
    return this;
  }

  computeMove(player, background, screenMiddle) {
    if (player.curAnim() === 'whip') return this;
    if (player.direction === 'right' && player.pos.x > screenMiddle) {
      player.pos.x = screenMiddle;
      background.move(-player.config.speed, 0);
    }

    if (player.direction === 'left' && player.pos.x < screenMiddle && background.pos.x < 0) {
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
          direction: 'right',
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

      player.play('standA');
      this.k.focus();

      this.registerPlayerAnimEnd(player)
        .registerKey(player);

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
