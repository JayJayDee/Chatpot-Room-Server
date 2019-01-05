import { init } from 'smart-factory';

(async () => {
  await init({
    includes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`],
    debug: true
  });
})();