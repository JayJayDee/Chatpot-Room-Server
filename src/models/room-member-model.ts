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
    async (param) =>
      await mysql.transaction(async (executor) => {
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
        `;
        const params = [ param.room_no, param.member_no, isOwner ];
        await executor.query(sql, params);

        const numUpdateSql = `
          UPDATE chatpot_room
            SET num_attendee = num_attendee + 1
            WHERE no=?
        `;
        await executor.query(numUpdateSql, [ param.room_no ]);

        const inspectSql = `
          SELECT
            (SELECT COUNT(no)
              FROM chatpot_room_has_member
              WHERE room_no=? AND member_no=?) AS member_cnt,
            r.num_attendee,
            r.max_attendee
          FROM
            chatpot_room r
          WHERE
            r.no=?
        `;
        const rows: any[] = await executor.query(inspectSql, [
          param.room_no, param.member_no, param.room_no
        ]) as any[];
        const memberCnt: number = rows[0].memberCnt;
        const numAttendee: number = rows[0].num_attendee;
        const maxAttendee: number = rows[0].max_attendee;

        let cause = null;
        if (memberCnt === 0) cause = 'JOIN_FAILURE';
        else if (memberCnt > 1) cause = 'ALREADY_JOINED';
        else if (numAttendee > maxAttendee) cause = 'CHAT_MAXIMUM_EXCEED';

        if (cause != null) {
          resp.success = false;
          resp.cause = cause;
          await executor.rollback();
          return resp;
        }
        resp.success = true;
        return resp;
      }
    ));

injectable(ModelModules.RoomMember.RemoveMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.RemoveMember> =>
    async (memberNo, roomNo) =>
      await mysql.transaction(async (executor) => {
        const ret: ModelTypes.RoomMemberRemoveRes = {
          success: false,
          destroyRequired: false,
          cause: null
        };
        const decreaseSql = `
          UPDATE
            chatpot_room
          SET
            num_attendee = num_attendee - 1
          WHERE
            no=?
        `;
        await executor.query(decreaseSql, [ roomNo ]);

        const removeSql = `
          DELETE FROM
            chatpot_room_has_member
          WHERE
            room_no=? AND
            member_no=?
        `;
        const resp: any = await executor.query(removeSql, [ roomNo, memberNo ]);

        if (resp.affectedRows !== 1) {
          executor.rollback();
          ret.cause = 'NOT_MEMBER_IN_ROOM';
          return ret;
        }
        ret.success = true;
        return ret;
      }));