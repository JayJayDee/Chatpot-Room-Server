import { injectable } from 'smart-factory';
import { shuffle, find } from 'lodash';

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
            rhmo.member_no AS owner_no,
            roulettem.member_no AS roulette_opponent_no
          FROM
            chatpot_room_has_member AS rhm
          INNER JOIN
            chatpot_room AS r ON r.no=rhm.room_no
          INNER JOIN
            chatpot_room_has_member AS rhmo ON
              rhmo.room_no=rhm.room_no AND rhmo.is_owner=1
          LEFT OUTER JOIN
            chatpot_room_has_member AS roulettem ON
              roulettem.room_no=r.no AND
              r.room_type='ROULETTE' AND roulettem.member_no != ?
          WHERE
            rhm.member_no=?
        `;
        const rows: any[] = await mysql.query(sql, [ memberNo, memberNo ]) as any[];
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
          cause: null,
          room_title: null
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
            r.max_attendee,
            r.title
          FROM
            chatpot_room r
          WHERE
            r.no=?
        `;
        const rows: any[] = await executor.query(inspectSql, [
          param.room_no, param.member_no, param.room_no
        ]) as any[];

        if (rows.length === 0) {
          await executor.rollback();
          resp.success = false;
          resp.cause = 'ROOM_NOT_FOUND';
          return resp;
        }

        const memberCnt: number = rows[0].member_cnt;
        const numAttendee: number = rows[0].num_attendee;
        const maxAttendee: number = rows[0].max_attendee;
        const roomTitle: string = rows[0].title;

        let cause = null;
        if (memberCnt === 0) cause = 'ROOM_JOIN_FAILURE';
        else if (memberCnt > 1) cause = 'ROOM_ALREADY_JOINED';
        else if (numAttendee > maxAttendee) cause = 'ROOM_MAXIMUM_EXCEED';

        if (cause != null) {
          await executor.rollback();
          resp.success = false;
          resp.cause = cause;
          return resp;
        }
        resp.room_title = roomTitle;
        resp.success = true;
        return resp;
      }
    ));

const electNewOwner = (con: MysqlTypes.MysqlTransaction | MysqlTypes.MysqlDriver) =>
  async (roomNo: number): Promise<number> => {
    const sql = `
      SELECT * FROM
        chatpot_room_has_member WHERE room_no=?
    `;
    const rows: any[] = await con.query(sql, [ roomNo ]) as any[];
    const ownerRow = find(rows, {is_owner: 1} as any);
    if (ownerRow) return null;

    const shuffledMemNos: number[] = shuffle(rows.map((r) => r.member_no));
    const newOwnerNo = shuffledMemNos[0];

    const updateSql = `
      UPDATE
        chatpot_room_has_member
      SET
        is_owner=1
      WHERE
        room_no=? AND member_no=?
    `;
    await con.query(updateSql, [ roomNo, newOwnerNo ]);
    return newOwnerNo;
  };

injectable(ModelModules.RoomMember.RemoveMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.RemoveMember> =>
    async (memberNo, roomNo) =>
      await mysql.transaction(async (executor) => {
        const ret: ModelTypes.RoomMemberRemoveRes = {
          success: false,
          roomTitle: null,
          roomType: null,
          destroyRequired: false,
          newOwnerNo: null,
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
        let resp: any = await executor.query(decreaseSql, [ roomNo ]);
        if (resp.affectedRows === 0) {
          executor.rollback();
          ret.cause = 'ROOM_NOT_FOUND';
          return ret;
        }

        const removeSql = `
          DELETE FROM
            chatpot_room_has_member
          WHERE
            room_no=? AND
            member_no=?
        `;
        resp  = await executor.query(removeSql, [ roomNo, memberNo ]);

        if (resp.affectedRows !== 1) {
          executor.rollback();
          ret.cause = 'NOT_MEMBER_IN_ROOM';
          return ret;
        }

        const numAteendeeSql = `
          SELECT
            num_attendee,
            room_type,
            title
          FROM
            chatpot_room
          WHERE no=?
        `;
        const rows: any[] = await executor.query(numAteendeeSql, [ roomNo ]) as any[];

        if (rows[0].num_attendee === 0 ||
            rows[0].num_attendee <= 1 && rows[0].room_type === 'ROULETTE') {
          ret.destroyRequired = true;
        }

        if (ret.destroyRequired === false) {
          const elect = electNewOwner(executor);
          ret.newOwnerNo = await elect(roomNo);
        }

        ret.roomType = rows[0].room_type;
        ret.roomTitle = rows[0].title;
        ret.success = true;
        return ret;
      }));

injectable(ModelModules.RoomMember.Members,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.Members> =>

    async (roomNo) => {
      const sql = `
        SELECT
          rhm.no,
          rhm.member_no,
          rhm.is_owner,
          rhm.join_date
        FROM
          chatpot_room_has_member AS rhm
        WHERE
          rhm.room_no=?
      `;
      const rows: any[] = await mysql.query(sql, [ roomNo ]) as any[];
      const members: ModelTypes.RoomMemberEntity[] = rows.map((r) => ({
        no: r.no,
        member_no: r.member_no,
        is_owner: r.is_owner === 1 ? true : false,
        join_date: r.join_date
      }));
      return members;
    });