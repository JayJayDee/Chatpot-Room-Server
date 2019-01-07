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
    token: string;
    region: string;
    language: string;
    gender: string;
    nick: Nick;
  };
  export type Nick = {
    en: string;
    ko: string;
    ja: string;
  };

  export namespace AuthReq {
    export type MembersByTokens = (tokens: string[]) => Promise<Member[]>;
    export type MembersByNos = (memberNos: number[]) => Promise<Member[]>;
  }
}