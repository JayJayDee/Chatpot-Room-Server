import { injectable } from 'smart-factory';
import { RouletteMatcherModules } from './modules';
import { MysqlModules, MysqlTypes } from '../mysql';
import { RouletteMatcherTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';

const tag = '[roulette-matcher]';

injectable(RouletteMatcherModules.Match,
  [ LoggerModules.Logger,
    MysqlModules.Mysql ],
  async (log: LoggerTypes.Logger,
    mysql: MysqlTypes.MysqlDriver): Promise<RouletteMatcherTypes.Match> =>

    async () => {
      await mysql.transaction(async (con) => {
        const pop = fetchOneRequest(con);

        log.debug(`${tag} fetching request ..`);
        const one = await pop({});

        if (one === null) {
          log.debug(`${tag} there is no request`);
          return;
        }

        log.debug(`${tag} there is request:${one.request_id}, fetching another request..`);

        const two = await pop({
          members_exclusion: [ one.member_no ],
          region_exclusion: one.region_type === RegionType.FOREIGNER ?
            one.member_region : null
        });

        if (two === null) {
          log.debug(`${tag} there is no matching-request`);
          return;
        }

        log.debug(`${tag} two reqeust matched!`);
        console.log(one);
        console.log(two);
      });
      return null;
    });


enum RegionType {
  FOREIGNER = 'FOREIGNER',
  ALL = 'ALL'
}
type FetchCondition = {
  members_exclusion?: number[];
  region_exclusion?: string;
};
type FetchedRow = {
  request_id: string;
  member_no: number;
  member_token: string;
  member_region: string;
  region_type: RegionType;
  reg_date: string;
};
const fetchOneRequest = (con: MysqlTypes.MysqlTransaction) =>
  async (condition: FetchCondition): Promise<FetchedRow> => {
    let whereClauses: string[] = [];
    const params: any[] = [];

    if (condition.members_exclusion) {
      whereClauses.push(`member_no NOT IN (${condition.members_exclusion.map((d) => '?').join(',')})`);
      condition.members_exclusion.forEach((m) => params.push(m));
    }

    if (condition.region_exclusion) {
      whereClauses.push(`member_region != ?`);
      params.push(condition.region_exclusion);
    }

    const whereClause =
      whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT
        *
      FROM
        chatpot_roulette_request
      ${whereClause}
      ORDER BY
        no ASC
      LIMIT 1
    `;
    const rows: any[] = await con.query(sql, params) as any[];
    if (rows.length === 0) return null;
    return {
      request_id: rows[0].request_id,
      member_no: rows[0].member_no,
      member_token: rows[0].member_token,
      member_region: rows[0].member_region,
      region_type: rows[0].target_region === 'FOREIGNER' ? RegionType.FOREIGNER : RegionType.ALL,
      reg_date: rows[0].reg_date
    };
  };