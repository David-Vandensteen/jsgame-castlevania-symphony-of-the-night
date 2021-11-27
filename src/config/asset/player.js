export default {
  asset: 'gfx/richter.png',
  speed: 100,
  animSpeed: 1.0,
  jump: 220,
  idleLoop: {
    max: 15,
    current: 0,
  },
  sprite: {
    sliceX: 8,
    sliceY: 7,
    anims: {
      standA: {
        from: 0,
        to: 3,
        loop: false,
      },
      standB: {
        from: 4,
        to: 5,
      },
      crouchA: {
        from: 8,
        to: 10,
      },
      crouchB: {
        from: 11,
        to: 12,
      },
      jump: {
        loop: false,
        from: 18,
        to: 22,
      },
      walk: {
        loop: true,
        from: 24,
        to: 31,
      },
      whip: {
        loop: false,
        from: 32,
        to: 39,
      },
      whipCrouch: {
        loop: false,
        from: 40,
        to: 46,
      },
      damaged: {
        loop: true,
        from: 48,
        to: 50,
      },
    },
  },
};
