import { init, resolve } from 'smart-factory';
import { MysqlTypes, MysqlModules } from './mysql';

(async () => {
  await init({
    includes: [`${__dirname}/**/*.ts`, `${__dirname}/**/*.js`]
  });

  const mysql: MysqlTypes.MysqlDriver =
    await resolve(MysqlModules.Mysql);
  console.log(mysql);
})();