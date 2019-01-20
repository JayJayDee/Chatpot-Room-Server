import { injectable } from 'smart-factory';
import { ModelModules } from './modules';
import { ModelTypes } from './types';
import { MysqlModules, MysqlTypes } from '../mysql';

injectable(ModelModules.History.Write,
  [ MysqlModules.Mysql ],
  async (mysql: MysqlTypes.MysqlDriver): Promise<ModelTypes.History.Write> =>

    async (elem) => {
      const valueMap: {[key: string]: any} = {
        action: elem.action,
        member_no: elem.member_no,
        room_no: elem.room_no
      };
      if (elem.room_title) valueMap['room_title'] = elem.room_title;
      const setClause = Object.keys(valueMap).map((k: string) => `${k}=?`).join(',');
      const params = Object.keys(valueMap).map((k: string) => valueMap[k]);
      const sql = `
        INSERT INTO
          chatpot_room_history
        SET
          ${setClause}, reg_date=NOW()
      `;
      await mysql.query(sql, params);
    });