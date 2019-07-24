import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ConfigModules, ConfigTypes } from '../configs';
import { ExtApiTypes } from './types';

const getArrayQs = (memberNos: number[]) =>
  memberNos.map((n) => `member_nos=${n}`).join('&');

injectable(ExtApiModules.AuthReq.MembersByNos,
  [ ConfigModules.ExternalApiConfig,
    ExtApiModules.Requestor ],
  async (cfg: ConfigTypes.ExternalApiConfig,
    request: ExtApiTypes.Request): Promise<ExtApiTypes.AuthReq.MembersByNos> =>

    async (memberNos: number[]) => {
      if (memberNos.length === 0) return [];
      const apiResp: any[] = await request({
        uri: `${cfg.authBaseUri}/internal/member?${getArrayQs(memberNos)}`,
        method: ExtApiTypes.RequestMethod.GET
      });
      const members: ExtApiTypes.Member[] = apiResp.map((elem) => ({
        member_no: elem.member_no,
        token: elem.token,
        region: elem.region,
        language: elem.language,
        gender: elem.gender,
        nick: elem.nick,
        avatar: elem.avatar,
        login_id: elem.login_id,
        auth_type: elem.auth_type
      }));
      return members;
    });