export namespace ModelTypes {
  export type RoomEntity = {
    no: number;
    token: string;
    owner_no: number;
    title: string;
    num_attendee: number;
    max_attendee: number;
    reg_date: Date
  };

  export type RoomMemberEntity = {
    no: number;
    member_no: number;
    is_owner: boolean;
    join_date: Date;
  };

  export type RoomListEntity = {
    all: number;
    size: number;
    list: RoomEntity[];
  };

  export type RoomSearchQuery = {
    offset?: number;
    size?: number;
    keyword?: string;
    region?: string;
  };
  export enum RoomOrder {
    CreatedDesc = 'CreatedDesc',
    LastUpdatedDesc = 'LastUpdatedDesc',
  }
  export type RoomCreateParam = {
    title: string;
    owner_no: number;
    max_attendee: number;
  };

  export namespace Room {
    export type List = (query: RoomSearchQuery, order?: RoomOrder) => Promise<RoomListEntity>;
    export type Get = (roomNo: number) => Promise<RoomEntity>;
    export type Create = (param: RoomCreateParam) => Promise<number>;
    export type UpdateToken = (roomNo: number, token: string) => Promise<void>;
  }
}