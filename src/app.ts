import { init, resolve } from 'smart-factory';
import { EndpointTypes, EndpointModules } from './endpoints';
import { RouletteMatcherTypes, RouletteMatcherModules } from './roulette-matcher';

(async () => {
  await init({
    includes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`]
  });

  const runHttpServer = resolve<EndpointTypes.EndpointRunner>(EndpointModules.EndpointRunner);
  runHttpServer();

  const runMatcherRunner = resolve<RouletteMatcherTypes.MatcherRunner>(RouletteMatcherModules.MatcherRunner);
  runMatcherRunner();
})();