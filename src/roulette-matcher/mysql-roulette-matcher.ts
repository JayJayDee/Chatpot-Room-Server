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

        log.debug(`${tag} there request:${one.request_id}, fetching another request..`);

        const two = await pop({
          members_exclusion: [ one.member_no ],
          region_type: one.region_type,
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
  region_type?: RegionType;
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

    return null;
  };