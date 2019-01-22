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
    export type Destroy = (roomNo: number) => Promise<void>;
  }


  export type RoomMemberAddParam = {
    room_no: number;
    member_no: number;
    is_owner: boolean;
  };
  export type RoomMemberAddRes = {
    success: boolean;
    cause: string | null;
  };
  export type RoomMemberRemoveRes = {
    success: boolean;
    destroyRequired: boolean;
    newOwnerNo: number;
    cause: string | null;
  };
  export namespace RoomMember {
    export type AddMember = (param: RoomMemberAddParam) => Promise<RoomMemberAddRes>;
    export type RemoveMember = (memberNo: number, roomNo: number) => Promise<RoomMemberRemoveRes>;
    export type MyRooms = (memberNo: number) => Promise<RoomEntity[]>;
    export type Members = (roomNo: number) => Promise<RoomMemberEntity[]>;
  }

  export namespace Converter {
    export type Room = (r: any) => RoomEntity;
  }

  export enum HistoryAction {
    CREATE = 'CREATE',
    JOIN = 'JOIN',
    LEAVE = 'LEAVE',
    DESTROY = 'DESTROY'
  }
  export type HistoryElement = {
    action: HistoryAction;
    member_no: number;
    room_no: number;
    room_title?: string;
  };
  export namespace History {
    export type Write = (elem: HistoryElement) => Promise<void>;
  }
}