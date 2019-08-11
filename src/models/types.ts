export namespace ModelTypes {
  export enum RoomType {
    PUBLIC = 'PUBLIC',
    ROULETTE = 'ROULETTE',
    ONEONEONE = 'ONEONONE'
  }
  export type RoomEntity = {
    no: number;
    token: string;
    owner_no: number;
    room_type: RoomType;
    title: string;
    num_attendee: number;
    max_attendee: number;
    roulette_opponent_no: number | null;
    reg_date: Date
  };
  export type RoomSimpleEntity = {
    token: string;
    title: string;
  };

  export type RoomMemberEntity = {
    no: number;
    member_no: number;
    is_owner: boolean;
    join_date: Date;
  };

  export type RoomListEntity = {
    all: number;
    offset: number;
    size: number;
    list: RoomEntity[];
  };

  export enum RoomOrder {
    REGDATE_ASC = 'REGDATE_ASC',
    REGDATE_DESC = 'REGDATE_DESC',
    ATTENDEE_DESC = 'ATTENDEE_DESC',
    ATTENDEE_ASC = 'ATTENDEE_ASC'
  }
  export type RoomSearchQuery = {
    offset?: number;
    size?: number;
    keyword?: string;
    region?: string;
    order?: RoomOrder;
  };
  export enum RoomOrder {
    CreatedDesc = 'CreatedDesc',
    LastUpdatedDesc = 'LastUpdatedDesc',
  }
  export type RoomCreateParam = {
    title: string;
    owner_no: number;
    max_attendee: number;
    room_type: RoomType;
  };

  export namespace Room {
    export type List = (query: RoomSearchQuery) => Promise<RoomListEntity>;
    export type Get = (roomNo: number) => Promise<RoomEntity>;
    export type GetMultiple = (roomNos: number[]) => Promise<RoomSimpleEntity[]>;
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
    room_title: string;
    cause: string | null;
  };
  export type RoomMemberRemoveRes = {
    success: boolean;
    roomTitle: string;
    roomType: RoomType;
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

  export namespace Roulette {
    enum RegionType {
      ALL = 'ALL',
      FOREIGNER = 'FOREIGNER'
    }
    type RequestParam = {
      region_type: RegionType;
      member_token: string;
      member_region: string;
      member_no: number;
      max_roulette: number;
    };
    type RequestRes = {
      request_id: string;
    };
    export type Request = (param: RequestParam) => Promise<RequestRes>;

    type CancelParam = {
      request_id: string;
    };
    export type Cancel = (param: CancelParam) => Promise<void>;

    type StatusParam = {
      member_no: number;
    };
    enum MatchStatus {
      WAITING = 'WATITING',
      MATCHED = 'MATCHED'
    }
    type RouletteStatus = {
      request_id: string;
      region_type: RegionType;
      match_status: MatchStatus;
      room_token: string | null;
      reg_date: number;
    };
    export type FetchStatuses = (param: StatusParam) => Promise<RouletteStatus[]>;
  }
}