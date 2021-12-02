import game from './game';
import { kaboomConfig, gameConfig, assetConfig } from './config/project';

const { log, error } = console;
const aspectRatio = window.innerWidth / window.innerHeight;

log('environement :', gameConfig.env);
log('requirement min aspect ratio :', gameConfig.aspectRatioRequirement.min);
log('requirement max aspect ratio :', gameConfig.aspectRatioRequirement.max);
log('current aspect ratio :', aspectRatio);
log('scale :', kaboomConfig.scale);

const menu = () => {
  if (aspectRatio < gameConfig.aspectRatioRequirement.min
    || aspectRatio > gameConfig.aspectRatioRequirement.max) {
    // TODO : listen resize event for auto start game
    let message = `Error : aspect ratio of the window must be lower than  ${gameConfig.aspectRatioRequirement.min}`;
    message += ` and highter than ${gameConfig.aspectRatioRequirement.max}`;
    message += '<br />';
    message += '<br />';
    message += `Your current aspect ratio is ${aspectRatio}`;
    message += '<br />';
    message += 'Change your window size and reload';
    document.body.innerHTML = `<p style="color:#FFFFFF; font-size:22px";>${message}</p>`;
    error('bad aspect ratio');
  } else {
    window.addEventListener('resize', () => {
      const message = '<p style="color:#FFFFFF; font-size:22px";>Oupssssss, sorry, resize is not supported...</p>';
      error(message);
      document.body.innerHTML = message;
    });
    document.body.innerHTML = '<button id="start">Start Game</button>';
    document.getElementById('start').style.height = '200px';
    document.getElementById('start').style.width = '300px';
    document.getElementById('start')
      .addEventListener('click', () => {
        log('start game');
        document.body.innerHTML = '';
        game({ kaboomConfig, gameConfig, assetConfig });
      });
  }
};

// eslint-disable-next-line no-unused-expressions
(gameConfig.env !== 'dev') ? menu() : game({ kaboomConfig, gameConfig, assetConfig });
