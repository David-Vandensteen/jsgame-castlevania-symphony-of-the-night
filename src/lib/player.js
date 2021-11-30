const { error } = console;

class Player {
  add() {
    const {
      add,
      sprite,
      opacity,
      pos,
      area,
      body,
    } = this.k;

    this.richter = add([
      sprite('richter', {
        animSpeed: this.config.richter.animSpeed,
      }),
      pos(100, 100),
      area(),
      body(), {
        config: this.config.richter,
      },
    ]);
    this.whip = add([
      sprite('whip', {
        animSpeed: this.config.whip.animSpeed,
      }),
      opacity(0),
      pos(120, 120), {
        config: this.config.whip,
      },
    ]);
    return this;
  }

  computeMove(level) {
    const { richter } = this;
    const { isDirectionLeft, isDirectionRight } = this.richter.states;
    const { background } = level;
    const screenMiddle = this.k.center().x;

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

  onAnimEnd() {
    const { richter, whip } = this;

    richter.onAnimEnd('standA', () => {
      if (richter.config.idleLoop.current >= richter.config.idleLoop.max) {
        richter.config.idleLoop.current = 0;
        if (richter.isGrounded()) richter.stateIdle('standB');
      } else {
        richter.config.idleLoop.current += 1;
        if (richter.isGrounded()) richter.stateIdle('standA');
      }
    });
    richter.onAnimEnd('crouchB', () => {
      if (!richter.states.isJump()) richter.stateIdle('standA');
    });
    richter.onAnimEnd('whip', () => {
      richter.stateIdle('standA');
      whip.stateIdle();
    });
    richter.onAnimEnd('whipCrouch', () => {
      richter.stateIdle('standA');
      whip.stateIdle();
    });
    return this;
  }

  onUpdate(level) {
    const { richter, whip } = this;
    this.whip.onUpdate(() => {
      if (whip.opacity) {
        if (whip.states.isDirectionRight() && !richter.states.isCrouch()) {
          whip.pos.x = richter.pos.x + 25;
          whip.pos.y = richter.pos.y - 20;
        } else {
          whip.pos.x = richter.pos.x - 25;
          whip.pos.y = richter.pos.y - 20;
        }
      }
      if (richter.states.isCrouch()) {
        if (whip.states.isDirectionRight()) {
          whip.pos.x = richter.pos.x + 25;
          whip.pos.y = richter.pos.y - 10;
        } else {
          whip.pos.x = richter.pos.x - 25;
          whip.pos.y = richter.pos.y - 10;
        }
      }
    });
    this.richter.onUpdate(() => {
      this.computeMove(level);
      if (richter.isGrounded()) {
        if (richter.states.isJump()) richter.stateIdle('standA');
      }
    });
    return this;
  }

  load() {
    const { loadSprite } = this.k;
    loadSprite('richter', this.config.richter.asset, this.config.richter.sprite);
    loadSprite('whip', this.config.whip.asset, this.config.whip.sprite);
    return this;
  }

  register(kaboom, config) {
    this.k = kaboom;
    this.config = config;
    return this;
  }

  registerKeys() {
    const { richter, whip } = this;
    const { onKeyDown, onKeyRelease } = this.k;
    const {
      isAttack,
      isIdle,
      isCrouch,
      isWalk,
      isJump,
    } = richter.states;

    const move = (direction) => {
      richter.stateDirection(direction);
      if (direction === 'left') {
        whip.stateDirection('left');
        richter.move(-richter.config.speed, 0);
      } else if (direction === 'right' && !isAttack()) {
        whip.stateDirection('right');
        richter.move(richter.config.speed, 0);
      }
      richter.config.idleLoop.current = 0;
      if (!isWalk() && !isJump()) richter.stateWalk('walk');
    };

    onKeyDown('left', () => {
      if ((isWalk() || isIdle() || isJump() || !isAttack()) && !isCrouch()) move('left');
    });
    onKeyRelease('left', () => {
      if (!isAttack() && !isJump()) richter.stateIdle('standA');
    });
    onKeyDown('right', () => {
      if ((isWalk() || isIdle() || isJump() || !isAttack()) && !isCrouch()) move('right');
    });
    onKeyRelease('right', () => {
      if (!isAttack() && !isJump()) richter.stateIdle('standA');
    });
    onKeyDown('up', () => {
      if (richter.isGrounded() && !isAttack()) richter.stateJump('jump');
    });
    onKeyDown('down', () => {
      if (richter.isGrounded() && !isCrouch() && !isJump() && !richter.states.isAttack()) richter.stateCrouch('crouchA');
    });
    onKeyRelease('down', () => {
      if (!isAttack() && !isCrouch()) richter.stateIdle('standA');
      if (isCrouch()) richter.stateCrouch('crouchB');
    });
    onKeyDown('space', () => {
      if (!richter.states.isCrouch()) {
        richter.stateAttack('whip');
        whip.stateAttack('attack');
      } else {
        richter.stateAttack('whipCrouch');
        whip.stateAttack('attack');
      }
    });
    return this;
  }

  registerStates() {
    const { richter, whip } = this;

    if (richter.states || whip.states) {
      error('states object already exist');
      return this;
    }

    richter.states = {
      idle: false,
      walk: false,
      jump: false,
      attack: false,
      crouch: false,
      direction: '',
      isIdle: () => richter.states.idle,
      isWalk: () => richter.states.walk,
      isJump: () => richter.states.jump,
      isAttack: () => richter.states.attack,
      isCrouch: () => richter.states.crouch,
      isDirectionLeft: () => richter.states.direction === 'left',
      isDirectionRight: () => richter.states.direction === 'right',
      reset: () => {
        richter.states.idle = false;
        richter.states.walk = false;
        richter.states.jump = false;
        richter.states.attack = false;
        richter.states.crouch = false;
      },
    };

    richter.stateIdle = (anim) => {
      richter.states.reset();
      richter.states.idle = true;
      richter.play(anim);
      return richter;
    };
    richter.stateWalk = (anim) => {
      richter.states.reset();
      richter.states.walk = true;
      if (richter.curAnim() !== 'walk') richter.play(anim);
      return richter;
    };
    richter.stateJump = (anim) => {
      richter.states.reset();
      richter.states.jump = true;
      richter.jump(richter.config.jump);
      if (richter.curAnim() !== 'jump') richter.play(anim);
      return richter;
    };
    richter.stateAttack = (anim) => {
      richter.states.idle = false;
      richter.states.walk = false;
      richter.states.attack = true;
      if (richter.curAnim() !== 'whip' && richter.curAnim() !== 'whipCrouch') {
        richter.play(anim);
        whip.opacity = false;
        whip.play('attack');
      }
      return richter;
    };
    richter.stateCrouch = (anim) => {
      richter.states.reset();
      richter.states.crouch = true;
      if (richter.curAnim() !== 'crouchB') richter.play(anim);
      return richter;
    };
    richter.stateDirection = (direction) => {
      richter.states.direction = direction;
      richter.flipX((direction === 'left'));
      return richter;
    };
    whip.states = {
      idle: false,
      attack: false,
      direction: '',
      isIdle: () => whip.states.idle,
      isAttack: () => whip.states.attack,
      isDirectionLeft: () => whip.states.direction === 'left',
      isDirectionRight: () => whip.states.direction === 'right',
      reset: () => {
        whip.states.idle = false;
        whip.states.attack = false;
      },
    };
    whip.stateDirection = (direction) => {
      whip.states.direction = direction;
      return whip;
    };
    whip.stateIdle = () => {
      whip.opacity = false;
      whip.states.reset();
      whip.states.idle = true;
      return whip;
    };
    whip.stateAttack = (anim) => {
      whip.opacity = true;
      whip.states.reset();
      whip.states.attack = true;
      if (whip.curAnim() !== 'attack') whip.play(anim);
      return whip;
    };
    whip.stateDirection = (direction) => {
      whip.states.direction = direction;
      whip.flipX((direction === 'left'));
      return whip;
    };
    return this;
  }
}

export default new Player();
