export namespace ExternalTypes {
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

  export namespace AuthApi {
    export type MembersByTokens = (tokens: string[]) => Promise<Member[]>;
    export type MembersByNos = (memberNos: number[]) => Promise<Member[]>;
  }
}