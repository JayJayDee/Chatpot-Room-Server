import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(ModelModules.RoomMember.AddMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.AddMember> =>
    async (param) => {
      const sql = `
        INSERT INTO chatpot_room_has_member
          (room_no, member_no, is_owner, join_date)
        SELECT
          ?, ?, ?, NOW()
        WHERE
          SELECT COUNT(no) FROM chatpot_room_has_member WHERE room_no=?
      `;
      const params = [ param.room_no, param.member_no, param.is_owner, param.room_no ];
      const resp: any = await mysql.query(sql, params);
      console.log(resp);
    });

injectable(ModelModules.RoomMember.RemoveMember,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.RoomMember.RemoveMember> =>
    async (roomNo, memberNo) => {
    });