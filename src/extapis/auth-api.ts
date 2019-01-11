import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ConfigModules, ConfigTypes } from '../configs';
import { ExtApiTypes } from './types';

injectable(ExtApiModules.AuthReq.MembersByNos,
  [ ConfigModules.ExternalApiConfig,
    ExtApiModules.Requestor ],
  async (cfg: ConfigTypes.ExternalApiConfig,
    request: ExtApiTypes.Request): Promise<ExtApiTypes.AuthReq.MembersByNos> =>

    async (memberNos: number[]) => {
      const apiResp: any[] = await request({
        uri: `${cfg.authBaseUri}/internal/member`,
        method: ExtApiTypes.RequestMethod.GET,
        qs: { member_nos: memberNos }
      });
      const members: ExtApiTypes.Member[] = apiResp.map((elem) => ({
        member_no: elem.member_no, // TODO: must be changed to member_no
        region: elem.region,
        language: elem.language,
        gender: elem.gender,
        nick: elem.nick
      }));
      return members;
    });