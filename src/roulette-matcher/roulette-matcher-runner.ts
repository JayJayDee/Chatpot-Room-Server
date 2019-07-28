import { injectable } from 'smart-factory';
import { RouletteMatcherModules } from './modules';
import { RouletteMatcherTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';

const tag = '[matcher-runner]';

let lastTick: number = null;

injectable(RouletteMatcherModules.MatcherRunner,
  [ LoggerModules.Logger,
    RouletteMatcherModules.Match ],
  async (log: LoggerTypes.Logger,
    match: RouletteMatcherTypes.Match): Promise<RouletteMatcherTypes.MatcherRunner> =>

    async () => {
      log.info(`${tag} matcher-runner up and started.`);
      while (true) {
        await match();
        await wait(5);
      }
    });


const wait = (intervalSec: number) =>
  new Promise((resolve, reject) => {
    if (lastTick === null) lastTick = Date.now();
    const handle = setInterval(() => {
      const now = Date.now();
      if (now - lastTick > intervalSec * 1000) {
        lastTick = now;
        clearInterval(handle);
        resolve();
      }
    }, 1000);
  });