export namespace UtilTypes {
  export type RoomPayload = {
    room_no: number;
    timestamp: number;
  };
  export namespace Auth {
    export type CreateRoomToken = (roomNo: number) => string;
    export type DecryptRoomToken = (roomToken: string) => RoomPayload;
  }
}