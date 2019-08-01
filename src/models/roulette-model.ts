import { createHash } from 'crypto';
import * as moment from 'moment';
import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';
import { BaseLogicError } from '../errors';

class RequestNotFoundError extends BaseLogicError {
  constructor(msg: string) {
    super('REQUEST_NOT_FOUND', msg);
  }
}
class InvalidRouletteStatusError extends BaseLogicError {
  constructor(msg: string) {
    super('INVALID_ROULETTE_STATUS', msg);
  }
}

injectable(ModelModules.Roulette.Cancel,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Roulette.Cancel> =>

    async (param) => {
      await mysql.transaction(async (con) => {
        const requestSql = `
          DELETE FROM
            chatpot_roulette_request
          WHERE
            request_id=?
        `;
        const resp = await mysql.query(requestSql, [ param.request_id ]) as any;
        if (resp.affectedRows !== 1) {
          throw new RequestNotFoundError(`request not found with request_id: ${param.request_id}`);
        }

        const checkerSql = `
          DELETE FROM
            chatpot_roulette_check
          WHERE
            request_id=? AND
            match_status='WAITING'
        `;
        const checkerResp = await mysql.query(checkerSql, [ param.request_id ]) as any;
        if (checkerResp.affectedRows !== 1) {
          throw new InvalidRouletteStatusError(`already matched request or request not found`);
        }
      });
    });


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

        return {
          request_id: requestId
        };
      });
      return resp;
    });


injectable(ModelModules.Roulette.FetchStatuses,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Roulette.FetchStatuses> =>

    async (param) => {
      const sql = `
        SELECT
          *
        FROM
          chatpot_roulette_check
        WHERE
          member_no=?
      `;
      const rows: any[] = await mysql.query(sql, [ param.member_no ]) as any[];
      return rows.map((r) => ({
        region_type: parseRegionType(r.target_region),
        request_id: r.request_id,
        match_status: parseMatchStatus(r.match_status),
        room_token: r.room_token,
        reg_date: parseInt(moment(r.reg_date).format('X'))
      }));
    });

const generateRequestId = (memberNo: number): string =>
  createHash('sha256').update(`${memberNo}${Date.now()}`).digest('hex');

enum RegionType {
  ALL = 'ALL',
  FOREIGNER = 'FOREIGNER'
}
const parseRegionType = (expr: string): RegionType =>
  expr === 'ALL' ? RegionType.ALL :
  RegionType.FOREIGNER;

enum MatchStatus {
  WAITING = 'WAITING',
  MATCHED = 'MATCHED'
}
const parseMatchStatus = (expr: string): MatchStatus =>
  expr === 'WAITING' ? MatchStatus.WAITING :
  MatchStatus.MATCHED;