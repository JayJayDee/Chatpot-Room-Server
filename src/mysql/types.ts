export namespace MysqlTypes {
  export type Row = any;
  export type ExecutionResult = {
    insertId?: number;
  };

  export interface MysqlDriver {
    query: (sql: string, params?: any[]) => Promise<Row[] | ExecutionResult>;
  }
}