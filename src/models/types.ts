export namespace ModelTypes {
  export type RoomEntity = {
    no: number;
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

  export type RoomSearchQuery = {
    offset: number;
    size: number;
    keyword: string;
    region: string;
  };

  export namespace Room {
    export type List = (query: RoomSearchQuery) => Promise<RoomEntity[]>;
    export type Get = (roomNo: number) => Promise<RoomEntity>;
  }
}