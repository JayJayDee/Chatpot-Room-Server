export namespace ExtApiModules {
  export const Requestor = 'ExtApi/Requestor';

  export enum AuthReq {
    MembersByNos = 'ExtApi/AuthReq/MembersByNos'
  }
  export enum MessageReq {
    EnterRoom = 'ExtApi/Message/EnterRoom',
    LeaveRoom = 'ExtApi/Message/LeaveRoom',
    LastMessages = 'ExtApi/Message/LastMessages',
    PublishMessage = 'ExtApi/Message/PublishMessage'
  }
}