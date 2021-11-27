/* eslint-disable no-param-reassign */

const { error } = console;

const playerRegisterStates = (player) => {
  if (player.states) {
    error('states object already exist');
    return player;
  }

  player.states = {
    idle: false,
    walk: false,
    jump: false,
    attack: false,
    crouch: false,
    direction: '',
    isIdle: () => player.states.idle,
    isWalk: () => player.states.walk,
    isJump: () => player.states.jump,
    isAttack: () => player.states.attack,
    isCrouch: () => player.states.crouch,
  };

  const reset = () => {
    player.states.idle = false;
    player.states.walk = false;
    player.states.jump = false;
    player.states.attack = false;
    player.states.crouch = false;
  };

  const { states, curAnim, jump } = player;

  player.stateIdle = (anim) => {
    reset();
    states.idle = true;
    player.play(anim);
  };
  player.stateWalk = (anim) => {
    reset();
    states.walk = true;
    if (curAnim() !== 'walk') player.play(anim);
  };
  player.stateJump = (anim) => {
    reset();
    states.jump = true;
    jump(player.config.jump);
    if (curAnim() !== 'jump') player.play(anim);
  };
  player.stateAttack = (anim) => {
    reset();
    states.attack = true;
    if (curAnim() !== 'whip') player.play(anim);
  };
  player.stateCrouch = (anim) => {
    reset();
    states.crouch = true;
    if (curAnim() !== 'crouchB') player.play(anim);
  };
  player.stateDirection = (direction) => {
    states.direction = direction;
  };
  return player;
};

const playerRegisterKeys = (player, kaboom) => {
  const {
    isAttack,
    isCrouch,
    isJump,
    isWalk,
  } = player.states;

  const {
    stateCrouch,
    stateIdle,
    stateJump,
    isGrounded,
  } = player;

  const move = (direction) => {
    // player.states.direction = direction; // TODO : direction setter
    player.stateDirection(direction);
    if (direction === 'left') {
      player.flipX(true);
      player.move(-player.config.speed, 0);
    } else if (direction === 'right' && !isAttack()) {
      player.flipX(false);
      player.move(player.config.speed, 0);
    }
    player.config.idleLoop.current = 0;
    if (!isWalk() && !isJump()) player.stateWalk('walk');
  };

  kaboom.onKeyDown('left', () => {
    if (!isCrouch() && !isAttack()) move('left');
  });

  kaboom.onKeyDown('right', () => {
    if (!isCrouch() && !isAttack()) move('right');
  });

  kaboom.onKeyRelease('left', () => {
    if (!isJump()) stateIdle('standA');
  });

  kaboom.onKeyRelease('right', () => {
    if (!isJump()) stateIdle('standA');
  });

  kaboom.onKeyDown('up', () => {
    if (isGrounded()) {
      stateJump('jump');
    }
  });

  kaboom.onKeyPress('down', () => {
    stateCrouch('crouchA');
  });

  kaboom.onKeyRelease('down', () => {
    stateCrouch('crouchB');
  });

  kaboom.onKeyDown('space', () => {
    player.stateAttack('whip');
  });
  return player;
};

const playerRegisterAnimEnd = (player) => {
  const { onAnimEnd, config, stateIdle } = player;
  const { isCrouch, isJump } = player.states;

  player.onAnimEnd('standA', () => {
    if (config.idleLoop.current >= config.idleLoop.max) {
      player.config.idleLoop.current = 0;
      if (!isCrouch() && !isJump()) stateIdle('standB');
    } else {
      player.config.idleLoop.current += 1;
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
  return player;
};

export { playerRegisterAnimEnd, playerRegisterKeys, playerRegisterStates };
