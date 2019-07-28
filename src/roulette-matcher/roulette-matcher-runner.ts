import { injectable } from 'smart-factory';
import { RouletteMatcherModules } from './modules';
import { RouletteMatcherTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';
import { ConfigModules, ConfigTypes } from '../configs';

const tag = '[matcher-runner]';

let lastTick: number = null;

injectable(RouletteMatcherModules.MatcherRunner,
  [ LoggerModules.Logger,
    RouletteMatcherModules.Match,
    ConfigModules.RouletteConfig ],
  async (log: LoggerTypes.Logger,
    match: RouletteMatcherTypes.Match,
    cfg: ConfigTypes.RouletteConfig): Promise<RouletteMatcherTypes.MatcherRunner> =>

    async () => {
      if (cfg.runnerEnabled === false) {
        log.info(`${tag} roulette-matcher-runner disabled. will not run.`);
        return;
      }

      log.info(`${tag} roulette-matcher-runner up and started.`);
      while (true) {
        await match();
        await wait(cfg.runnerPeriod);
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