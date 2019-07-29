import { ExtApiTypes } from '../extapis';
import { ModelTypes } from '../models';

export namespace ServiceTypes {
  export type Avatar = {
    profile_img: string;
    profile_thumb: string;
  };
  export type Member = {
    token: string;
    region: string;
    language: string;
    gender: string;
    nick: ExtApiTypes.Nick;
    avatar: Avatar;
    auth_type: string;
    login_id: string;
  };
  export enum RoomType {
    PUBLIC = 'PUBLIC',
    ROULETTE = 'ROULETTE',
    ONEONEONE = 'ONEONONE'
  }
  export type Room = {
    room_token: string;
    room_type: RoomType;
    owner: Member;
    title: string;
    num_attendee: number;
    max_attendee: number;
    reg_date: Date;
  };
  export enum MessageType {
    NOTIFICATION = 'NOTIFICATION',
    TEXT = 'TEXT',
    IMAGE = 'IMAGE'
  }
  export type Reception = {
    type: ReceptionType;
    token: string;
  };
  export enum ReceptionType {
    ROOM = 'ROOM'
  }
  export type Message = {
    message_id: string;
    type: MessageType;
    from: Member;
    to: Reception;
    content: any;
    sent_time: number;
  };
  export interface MyRoom extends Room {
    last_message: Message;
  }
  export type RoomList = {
    all: number;
    size: number;
    offset: number;
    list: Room[];
  };
  export interface RoomDetail extends Room {
    members: Member[];
  }

  export type ReqRoomCreate = {
    owner_token: string;
    owner_no: number;
    title: string;
    max_attendee: number;
  };
  export type ResRoomCreate = {
    room_token: string;
  };

  export interface RoomMember extends Member {
    is_owner: boolean;
    join_date: Date;
  }

  export type ReqRoomJoin = {
    member_no: number;
    member_token: string;
    room_no: number;
    room_token: string;
  };
  export type ReqRoomLeave = {
    member_no: number;
    member_token: string;
    room_no: number;
    room_token: string;
  };

  type ChatRouletteReq = {
    owner_token: string;
    owner_no: number;
    attendee_token: string;
    attendee_no: number;
    title: string;
    max_attendee: number;
  };

  type ChatRouletteRes = {
    room_token: string;
    room_no: number;
  };

  export namespace RoomService {
    export type List = (query: ModelTypes.RoomSearchQuery, order?: ModelTypes.RoomOrder) => Promise<RoomList>;
    export type Create = (param: ReqRoomCreate) => Promise<ResRoomCreate>;
    export type CreateRoulette = (param: ChatRouletteReq) => Promise<ChatRouletteRes>;
    export type Join = (param: ReqRoomJoin) => Promise<void>;
    export type Leave = (param: ReqRoomLeave) => Promise<void>;
    export type Get = (roomNo: number) => Promise<RoomDetail>;
  }

  export namespace MyService {
    export type Rooms = (memberNo: number) => Promise<MyRoom[]>;
  }

  export namespace Roulette {
    type Gender = 'M' | 'F' | 'NOT_YET';
    type MatchFilter = {
      region?: String;
      gender?: Gender;
    };
    type Request = {
      request_id: number;
      matched: boolean;
    };

    export type MatchRequest = (memberNo: number, filter?: MatchFilter) => Promise<void>;
    export type GetMyRequests = (memberNo: number) => Promise<Request[]>;
  }
}