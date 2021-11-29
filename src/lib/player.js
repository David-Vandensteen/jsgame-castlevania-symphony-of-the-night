const { error } = console;

class Player {
  add() {
    this.richter = this.k.add([
      this.k.sprite('richter', {
        animSpeed: this.config.richter.animSpeed,
      }),
      this.k.pos(100, 100),
      this.k.area(),
      this.k.body(), {
        config: this.config.richter,
      },
    ]);
    this.whip = this.k.add([
      this.k.sprite('whip', {
        animSpeed: this.config.whip.animSpeed,
      }),
      this.k.opacity(0),
      this.k.pos(120, 120), {
        config: this.config.whip,
      },
    ]);
    return this;
  }

  onAnimEnd() {
    const { richter } = this;
    const {
      onAnimEnd,
      config,
      stateIdle,
      stateCrouch,
    } = richter;

    const { isCrouch, isJump } = richter.states;

    onAnimEnd('standA', () => {
      if (config.idleLoop.current >= config.idleLoop.max) {
        config.idleLoop.current = 0;
        if (!isCrouch() && !isJump()) stateIdle('standB');
      } else {
        config.idleLoop.current += 1;
        if (!isCrouch() && !isJump()) stateIdle('standA');
      }
    });

    onAnimEnd('crouchB', () => {
      stateIdle('standA');
    });
    onAnimEnd('jump', () => {
      stateIdle('standA');
    });
    onAnimEnd('whip', () => {
      stateIdle('standA');
    });
    onAnimEnd('whipCrouch', () => {
      if (isCrouch()) {
        stateCrouch('crouchA');
      } else {
        stateIdle('standA');
      }
    });
    return this;
  }

  load() {
    this.k.loadSprite('richter', this.config.richter.asset, this.config.richter.sprite);
    this.k.loadSprite('whip', this.config.whip.asset, this.config.whip.sprite);
    return this;
  }

  register(kaboom, config) {
    this.k = kaboom;
    this.config = config;
    return this;
  }

  registerKeys() {
    const { richter } = this;
    const {
      isAttack,
      isCrouch,
      isJump,
      isWalk,
      isIdle,
    } = richter.states;

    const {
      stateAttack,
      stateCrouch,
      stateIdle,
      stateJump,
      isGrounded,
    } = richter;

    const {
      onKeyDown,
      onKeyPress,
      onKeyRelease,
    } = this.k;

    const move = (direction) => {
      richter.stateDirection(direction);
      if (direction === 'left') {
        richter.flipX(true);
        richter.move(-richter.config.speed, 0);
      } else if (direction === 'right' && !isAttack()) {
        richter.flipX(false);
        richter.move(richter.config.speed, 0);
      }
      richter.config.idleLoop.current = 0;
      if (!isWalk() && !isJump()) richter.stateWalk('walk');
    };

    onKeyDown('left', () => { if (!isCrouch() && !isAttack()) move('left'); });
    onKeyDown('right', () => { if (!isCrouch() && !isAttack()) move('right'); });
    onKeyRelease('left', () => { if (!isJump() && !isCrouch() && !isAttack()) stateIdle('standA'); });
    onKeyRelease('right', () => { if (!isJump() && !isCrouch() && !isAttack()) stateIdle('standA'); });
    onKeyDown('up', () => { if (isGrounded() && !isAttack() && !isCrouch()) { stateJump('jump'); } });
    onKeyPress('down', () => { stateCrouch('crouchA'); });
    onKeyRelease('down', () => { if (!isJump() && !isWalk() && !isAttack() && !isIdle()) stateCrouch('crouchB'); });

    onKeyDown('space', () => {
      if (!isCrouch()) {
        stateAttack('whip');
      } else {
        stateAttack('whipCrouch');
      }
    });
    return this;
  }

  registerStates() {
    const { richter, whip } = this;

    if (richter.states) {
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
    };

    const reset = () => {
      richter.states.idle = false;
      richter.states.walk = false;
      richter.states.jump = false;
      richter.states.attack = false;
      richter.states.crouch = false;
    };

    const {
      states,
      curAnim,
      jump,
    } = richter;

    richter.stateIdle = (anim) => {
      reset();
      states.idle = true;
      richter.play(anim);
      return richter;
    };
    richter.stateWalk = (anim) => {
      reset();
      states.walk = true;
      if (curAnim() !== 'walk') richter.play(anim);
      return richter;
    };
    richter.stateJump = (anim) => {
      reset();
      states.jump = true;
      jump(richter.config.jump);
      if (curAnim() !== 'jump') richter.play(anim);
      return richter;
    };
    richter.stateAttack = (anim) => {
      states.idle = false;
      states.walk = false;
      states.jump = false;
      states.attack = true;
      if (curAnim() !== 'whip' && curAnim() !== 'whipCrouch') {
        richter.play(anim);
        whip.opacity = 0;
        whip.play('attack');
      }
      return richter;
    };
    richter.stateCrouch = (anim) => {
      reset();
      states.crouch = true;
      if (curAnim() !== 'crouchB') richter.play(anim);
      return richter;
    };
    richter.stateDirection = (direction) => {
      states.direction = direction;
      return richter;
    };
    return this;
  }
}

export default new Player();
