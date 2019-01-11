export namespace ServiceTypes {
  export type Room = {
    token: string;

  };

  export namespace RoomService {
    export type List = (query: any) => Promise<Room[]>; // TODO: to be modified to any -> Room type
  }
}