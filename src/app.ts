import { init, resolve } from 'smart-factory';
import { ConfigTypes, ConfigModules } from './config';

(async () => {
  await init({
    includes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`]
  });

  const httpCfg: ConfigTypes.HttpConfig = await resolve(ConfigModules.HttpConfig);
  console.log(httpCfg);
})();