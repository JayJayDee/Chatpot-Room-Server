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
  };
  export type Room = {
    room_token: string;
    owner: Member;
    title: string;
    num_attendee: number;
    max_attendee: number;
    reg_date: Date;
  };
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

  export namespace RoomService {
    export type List = (query: ModelTypes.RoomSearchQuery, order?: ModelTypes.RoomOrder) => Promise<RoomList>;
    export type Create = (param: ReqRoomCreate) => Promise<ResRoomCreate>;
    export type Join = (param: ReqRoomJoin) => Promise<void>;
    export type Leave = (param: ReqRoomLeave) => Promise<void>;
    export type Get = (roomNo: number) => Promise<RoomDetail>;
  }

  export namespace MyService {
    export type Rooms = (memberNo: number) => Promise<Room[]>;
  }
}