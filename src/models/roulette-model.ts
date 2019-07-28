import { createHash } from 'crypto';
import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';
import { BaseLogicError } from '../errors';

class MaxRouletteExceedError extends BaseLogicError {
  constructor() {
    super('MAX_ROULETTE_EXCEED', 'number of max roulette exceeded');
  }
}

injectable(ModelModules.Roulette.Request,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Roulette.Request> =>

    async (param) => {
      const requestId = generateRequestId(param.member_no);
      const resp = await mysql.transaction(async (con) => {
        const checkInsertSql = `
          INSERT INTO
            chatpot_roulette_check
          SET
            request_id=?,
            member_no=?,
            target_region=?,
            match_status=?,
            reg_date=NOW()
        `;
        await con.query(checkInsertSql, [
          requestId,
          param.member_no,
          param.region_type,
          'WAITING'
        ]);

        const requestInsertSql = `
          INSERT INTO
            chatpot_roulette_request
          SET
            request_id=?,
            member_no=?,
            member_token=?,
            member_region=?,
            target_region=?,
            reg_date=NOW()
        `;
        await con.query(requestInsertSql, [
          requestId,
          param.member_no,
          param.member_token,
          param.member_region,
          param.region_type
        ]);

        const inspectionSql = `SELECT COUNT(no) AS current_count FROM chatpot_roulette_check WHERE member_no=?`;
        const rows = await con.query(inspectionSql, [ param.member_no ]) as any[];
        if (rows[0].current_count > param.max_roulette) {
          throw new MaxRouletteExceedError();
        }

        return { test: 'test '};
      });
      return resp;
    });


injectable(ModelModules.Roulette.Status,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Roulette.FetchStatuses> =>

    async (param) => {
      return [];
    });


const generateRequestId = (memberNo: number): string =>
  createHash('sha256').update(`${memberNo}${Date.now()}`).digest('hex');