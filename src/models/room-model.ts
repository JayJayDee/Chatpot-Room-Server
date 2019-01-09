import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { MysqlModules, MysqlTypes } from '../mysql';
import { ModelTypes } from './types';

injectable(ModelModules.Room.List,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.List> =>
    async (param) => {
      let offset: number = param.offset ? param.offset : 0;
      let size: number = param.size ? param.size : 10;

      const query = `
        SELECT
          *
        FROM
          chatpot_room
        LIMIT
          ?,?
      `;
      const params = [ offset, size ];
      const rows: any[] = await mysql.query(query, params) as any[];
      const rooms: ModelTypes.RoomEntity[] = rows.map((r) => ({
        no: r.no,
        title: r.title,
        num_attendee: r.num_attendee,
        max_attendee: r.max_attendee,
        reg_date: r.reg_date
      }));
      return {
        all: 100, // TODO: to be replaced to num_all with no-filtered.
        size: rooms.length,
        list: rooms
      };
    });

injectable(ModelModules.Room.Get,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.Get> =>
    async (roomNo: number) => {
      return null;
    });