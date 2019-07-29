import { injectable } from 'smart-factory';
import { RouletteMatcherModules } from './modules';
import { MysqlModules, MysqlTypes } from '../mysql';
import { RouletteMatcherTypes } from './types';
import { LoggerModules, LoggerTypes } from '../loggers';
import { ServiceModules, ServiceTypes } from '../services';

const tag = '[roulette-matcher]';

injectable(RouletteMatcherModules.Match,
  [ LoggerModules.Logger,
    MysqlModules.Mysql,
    ServiceModules.Room.CreateRoulette ],
  async (log: LoggerTypes.Logger,
    mysql: MysqlTypes.MysqlDriver,
    createRouletteRoom: ServiceTypes.RoomService.CreateRoulette): Promise<RouletteMatcherTypes.Match> =>

    async () => {
      await mysql.transaction(async (con) => {
        const pop = fetchOneRequest(con);
        const deleteMy = deleteRequests(con);
        const updateMy = updateCheckers(con);

        const one = await pop({});

        if (one === null) {
          return;
        }

        const two = await pop({
          members_exclusion: [ one.member_no ],
          region_exclusion: one.region_type === RegionType.FOREIGNER ?
            one.member_region : null
        });

        if (two === null) {
          return;
        }

        const requestIds = [
          one.request_id,
          two.request_id
        ];
        log.debug(`${tag} two reqeust matched. request_ids=`);
        console.log(requestIds);

        const createRes = await createRouletteRoom({
          owner_no: one.member_no,
          owner_token: one.member_token,
          attendee_no: two.member_no,
          attendee_token: two.member_token,
          title: '-',
          max_attendee: 2
        });

        await deleteMy(requestIds);
        await updateMy({
          request_ids: requestIds,
          room_no: createRes.room_no,
          room_token: createRes.room_token
        });
      });
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


const deleteRequests = (con: MysqlTypes.MysqlTransaction) =>
  async (requestIds: string[]) => {
    const inClause = requestIds.map((r) => '?').join(',');
    const sql =
    `
      DELETE FROM
        chatpot_roulette_request
      WHERE
        request_id IN (${inClause})
    `;
    await con.query(sql, requestIds);
  };

type CheckerParam = {
  request_ids: string[];
  room_no: number;
  room_token: string;
};
const updateCheckers = (con: MysqlTypes.MysqlTransaction) =>
  async (param: CheckerParam) => {
    const inClause = param.request_ids.map((r) => '?').join(',');
    const params = [
      param.room_no,
      param.room_token
    ];
    param.request_ids.forEach((id) => params.push(id));
    const sql = `
      UPDATE
        chatpot_roulette_check
      SET
        room_no=?,
        room_token=?,
        match_status='MATCHED'
      WHERE
        request_id IN (${inClause}) AND
        match_status='WAITING'
    `;
    await con.query(sql, params) as any;
  };