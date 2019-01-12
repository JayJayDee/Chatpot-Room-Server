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
          r.*,
          rhm.member_no AS owner_no
        FROM
          chatpot_room AS r
        INNER JOIN
          chatpot_room_has_member AS rhm ON
            rhm.room_no=r.no AND rhm.is_owner=1
        LIMIT
          ?,?
      `;
      const params = [ offset, size ];
      const rows: any[] = await mysql.query(query, params) as any[];
      const rooms: ModelTypes.RoomEntity[] = rows.map((r) => ({
        no: r.no,
        token: r.token,
        owner_no: r.owner_no,
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

injectable(ModelModules.Room.Create,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.Create> =>
    async (param) => {
      return 1;
    });

injectable(ModelModules.Room.UpdateToken,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.UpdateToken> =>
    async (roomNo: number, token: string) => {

    });