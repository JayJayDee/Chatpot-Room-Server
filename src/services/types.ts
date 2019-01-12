import { ExtApiTypes } from '../extapis';
import { ModelTypes } from '../models';

export namespace ServiceTypes {
  export type Room = {
    room_token: string;
    owner: ExtApiTypes.Member;
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

  export namespace RoomService {
    export type List = (query: ModelTypes.RoomSearchQuery) => Promise<RoomList>;
  }
}