import { ExtApiTypes } from '../extapis';
import { ModelTypes } from '../models';

export namespace ServiceTypes {
  export type Member = {
    member_token: string;
    region: string;
    language: string;
    gender: string;
    nick: ExtApiTypes.Nick;
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
    list: Room[];
  };

  export type ReqRoomCreate = {
    owner_no: number;
    title: string;
    max_attendee: number;
  };
  export type ResRoomCreate = {
    room_token: string;
  };

  export namespace RoomService {
    export type List = (query: ModelTypes.RoomSearchQuery, order?: ModelTypes.RoomOrder) => Promise<RoomList>;
    export type Create = (param: ReqRoomCreate) => Promise<ResRoomCreate>;
  }
}