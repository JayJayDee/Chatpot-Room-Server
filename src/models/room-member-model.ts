import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(ModelModules.RoomMember.MyRooms,
  [ MysqlModules.Mysql,
    ModelModules.Converter.Room ],
  async (mysql: MysqlTypes.MysqlDriver,
    cvtRoom: ModelTypes.Converter.Room): Promise<ModelTypes.RoomMember.MyRooms> =>
      async (memberNo) => {
        const sql = `
          SELECT
            r.*,
            rhm.member_no AS owner_no
          FROM
            chatpot_room_has_member AS rhm
          INNER JOIN
            chatpot_room AS r ON r.no=rhm.room_no
          WHERE
            rhm.member_no=?
        `;
        const rows: any[] = await mysql.query(sql, [ memberNo ]) as any[];
        const rooms: ModelTypes.RoomEntity[] = rows.map(cvtRoom);
        return rooms;
      });

injectable(ModelModules.RoomMember.AddMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.AddMember> =>
    async (param) => {
      const resp: ModelTypes.RoomMemberAddRes = {
        success: false,
        cause: null
      };
      const isOwner: number = param.is_owner === true ? 1 : 0;
      const sql = `
        INSERT INTO chatpot_room_has_member
          (room_no, member_no, is_owner, join_date)
        SELECT
          ?, ?, ?, NOW()
        WHERE
          (SELECT COUNT(no) FROM
            chatpot_room_has_member
              WHERE room_no=? AND member_no=?) = 0 AND
          (SELECT IF(num_attendee >= max_attendee, 1, 0) FROM
            chatpot_room WHERE no=?) = 0
      `;
      const params = [ param.room_no, param.member_no, isOwner,
        param.room_no, param.member_no, param.room_no ];
      await mysql.query(sql, params);

      const inspectSql = `
        SELECT
          *
        FROM
          chatpot_room_has_member
        WHERE
          room_no=? AND member_no=? AND is_owner=?
      `;
      const rows: any[] = await mysql.query(inspectSql, [
        param.room_no, param.member_no, isOwner
      ]) as any[];

      if (rows.length === 0) {
        resp.success = false;
        resp.cause = 'failed to join the room';
        return resp;
      }
      resp.success = true;
      return resp;
    });

injectable(ModelModules.RoomMember.RemoveMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.RemoveMember> =>
    async (roomNo, memberNo) => {
    });