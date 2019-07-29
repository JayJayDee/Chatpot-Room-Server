import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { MysqlModules, MysqlTypes } from '../mysql';
import { ModelTypes } from './types';

injectable(ModelModules.Room.List,
  [ MysqlModules.Mysql,
    ModelModules.Converter.Room ],
  async (mysql: MysqlTypes.MysqlDriver,
    cvtRoom: ModelTypes.Converter.Room): Promise<ModelTypes.Room.List> =>
      async (param) => {
        let offset: number = param.offset ? param.offset : 0;
        let size: number = param.size ? param.size : 10;
        let order: ModelTypes.RoomOrder = param.order ? param.order : ModelTypes.RoomOrder.REGDATE_DESC;

        const prepare = prepareOptionalSearchQueries(mysql);
        const where = prepare({ keyword: param.keyword, region: param.region });

        const query = `
          SELECT
            r.*,
            rhm.member_no AS owner_no
          FROM
            chatpot_room AS r
          INNER JOIN
            chatpot_room_has_member AS rhm ON
              rhm.room_no=r.no AND rhm.is_owner=1
          ${where.whereClause}
          ${getOrderQuery(order)}
          LIMIT
            ?,?
        `;
        const params = [ ...where.params, offset, size ];

        const wholeSizeQuery = `
          SELECT
            COUNT(r.no) AS num_whole
          FROM
            chatpot_room AS r
          INNER JOIN
            chatpot_room_has_member AS rhm ON
              rhm.room_no=r.no AND rhm.is_owner=1
          ${where.whereClause}`;

        const rows: any[] = await mysql.query(query, params) as any[];
        const foundRows: any[] = await mysql.query(wholeSizeQuery, [ ...where.params ]) as any[];

        const all = foundRows[0].num_whole;
        const rooms: ModelTypes.RoomEntity[] = rows.map(cvtRoom);
        return {
          all,
          offset,
          size: rooms.length,
          list: rooms
        };
      });

const getOrderQuery = (order: ModelTypes.RoomOrder): string => {
  if (order === ModelTypes.RoomOrder.REGDATE_DESC) return 'ORDER BY r.reg_date DESC';
  else if (order === ModelTypes.RoomOrder.REGDATE_ASC) return 'ORDER BY r.reg_date ASC';
  else if (order === ModelTypes.RoomOrder.ATTENDEE_DESC) return 'ORDER BY r.num_attendee DESC';
  else if (order === ModelTypes.RoomOrder.ATTENDEE_ASC) return 'ORDER BY r.num_attendee ASC';
  return '';
};


type OptionalSearchQuery = {
  keyword?: string;
  region?: string;
};
type OptionalQueryParams = {
  whereClause: string;
  params: any[];
};

const prepareOptionalSearchQueries = (driver: MysqlTypes.MysqlDriver) =>
  (opts: OptionalSearchQuery): OptionalQueryParams => {
    const res: OptionalQueryParams = {
      whereClause: '',
      params: []
    };
    const clauseBlocks = [];
    if (opts.keyword) {
      res.params.push('%' + opts.keyword + '%');
      clauseBlocks.push(`r.title LIKE ?`);
    }
    if (opts.region) {
      res.params.push(opts.region);
      clauseBlocks.push('m.region=?');
    }
    clauseBlocks.push('room_type=?');
    res.params.push('PUBLIC');

    const where = clauseBlocks.length > 0 ? ' WHERE ' : '';
    res.whereClause = `${where} ${clauseBlocks.join(' AND ')}`;
    return res;
  };

injectable(ModelModules.Room.Get,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.Get> =>
    async (roomNo: number) => {
      const sql = `
        SELECT
          r.*,
          rhm.member_no AS owner_no,
          roulettem.member_no AS roulette_opponent_no
        FROM
          chatpot_room AS r
        INNER JOIN
          chatpot_room_has_member AS rhm
            ON rhm.room_no=r.no AND rhm.is_owner=1
        LEFT OUTER JOIN
          chatpot_room_has_member AS roulettem ON
            roulettem.room_no=r.no AND
            r.room_type='ROULETTE' AND roulettem.member_no != ?
        WHERE
          r.no=?
      `;
      const rows: any[] = await mysql.query(sql, [ roomNo ]) as any[];
      if (rows.length === 0) return null;
      const room: ModelTypes.RoomEntity = {
        no: rows[0].no,
        room_type: rows[0].room_type,
        token: rows[0].token,
        owner_no: rows[0].owner_no,
        title: rows[0].title,
        num_attendee: rows[0].num_attendee,
        max_attendee: rows[0].max_attendee,
        roulette_opponent_no: rows[0].roulette_opponent_no,
        reg_date: rows[0].reg_date
      };
      return room;
    });

injectable(ModelModules.Room.GetMultiple,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.GetMultiple> =>
    async (roomNos) => {
      if (roomNos.length === 0) return [];
      const inClause = roomNos.join(',');
      const sql = `
        SELECT
          r.token,
          r.title
        FROM
          chatpot_room r
        WHERE
          r.no IN (${inClause})
      `;
      const rows: any[] = await mysql.query(sql) as any[];
      const rooms: ModelTypes.RoomSimpleEntity[] = rows.map((r) => ({
        title: r.title,
        token: r.token
      }));
      return rooms;
    });

injectable(ModelModules.Room.Create,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.Create> =>
    async (param) => {
      const sql = `
        INSERT INTO
          chatpot_room
        SET
          title=?,
          num_attendee=0,
          max_attendee=?,
          room_type=?,
          reg_date=NOW()
      `;
      const params: any[] = [ param.title, param.max_attendee, param.room_type ];
      const resp: any = await mysql.query(sql, params);
      if (resp.affectedRows !== 1) return null;
      const newRoomNo: number = resp.insertId;
      return newRoomNo;
    });

injectable(ModelModules.Room.UpdateToken,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.UpdateToken> =>
    async (roomNo: number, token: string) => {
      const sql = `
        UPDATE
          chatpot_room
        SET
          token=?
        WHERE
          no=?
      `;
      const params: any[] = [ token, roomNo ];
      const resp: any = await mysql.query(sql, params);
      if (resp.affectedRows !== 1) {
        // TODO: throw exception.
      }
    });

injectable(ModelModules.Room.Destroy,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.Room.Destroy> =>
    async (roomNo) => {
      const sql = `
        DELETE FROM
          chatpot_room
        WHERE
          no=? AND
          num_attendee = 0
      `;
      await mysql.query(sql, [ roomNo ]);
      // TODO: think about cas of not-deleted room.
    });