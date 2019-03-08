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
}