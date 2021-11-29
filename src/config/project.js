const config = {
  game: {
    gravity: 640,
    aspectRatioRequirement: {
      min: 1.1,
      max: 2,
    },
    env: 'prod',
  },
  kaboom: {
    fullscreen: true,
    scale: window.innerWidth / 408,
    clearColor: [0, 0, 0, 1],
    background: [0, 0, 0],
    debug: true,
  },
  asset: {
    root: 'http://localhost:3000/asset/',
  },
};
export default { config };
export const { kaboom: kaboomConfig, game: gameConfig, asset: assetConfig } = config;
