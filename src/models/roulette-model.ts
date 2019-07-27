import { createHash } from 'crypto';
import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(ModelModules.Roulette.Request,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Roulette.Request> =>

    async (param) => {
      const requestId = generateRequestId(param.member_no);
      console.log(requestId);
      const resp = await mysql.transaction(async (con) => {
      });
      return resp;
    });


injectable(ModelModules.Roulette.Status,
  [],
  async () => {});


const generateRequestId = (memberNo: number): string =>
  createHash('sha256').update(`${memberNo}${Date.now()}`).digest('hex');