export namespace ModelTypes {
  export type RoomEntity = {
    no: number;
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

  export namespace Room {
    export type List = (query: RoomSearchQuery) => Promise<RoomListEntity>;
    export type Get = (roomNo: number) => Promise<RoomEntity>;
  }
}