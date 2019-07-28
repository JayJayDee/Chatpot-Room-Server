export namespace ExtApiTypes {
  export enum RequestMethod {
    POST = 'post', GET = 'get'
  }
  export type RequestParam = {
    uri: string,
    method: RequestMethod,
    qs?: {[key: string]: any};
    body?: {[key: string]: any};
    headers?: {[key: string]: any};
  };
  export type Request = (param: RequestParam) => Promise<any>;

  export type Member = {
    member_no: number;
    token: string;
    region: string;
    language: string;
    gender: string;
    nick: Nick;
    avatar: Avatar;
    auth_type: string;
    login_id: string;
    max_roulette: number;
  };
  export type Nick = {
    en: string;
    ko: string;
    ja: string;
  };
  export type Avatar = {
    profile_img: string;
    profile_thumb: string;
  };

  export namespace AuthReq {
    export type MembersByNos = (memberNos: number[]) => Promise<Member[]>;
  }

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
  export type LastMessageRes = {[token: string]: Message};

  type NotificationMessage = {
    messageType: MessageType;
    roomTitle: string;
    action: 'JOIN_ROOM' | 'LEAVE_ROOM';
    member: Member;
  };

  export namespace MessageReq {
    export type EnterRoom = (memberToken: string, roomToken: string) => Promise<void>;
    export type LeaveRoom = (memberToken: string, roomToken: string) => Promise<void>;
    export type LastMessages = (roomTokens: string[]) => Promise<LastMessageRes>;
    export type PublishNotification = (roomToken: string, notification: NotificationMessage) => Promise<void>;
  }
}