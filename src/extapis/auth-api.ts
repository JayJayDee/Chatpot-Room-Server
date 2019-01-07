import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ConfigModules, ConfigTypes } from '../configs';
import { ExtApiTypes } from './types';

injectable(ExtApiModules.AuthReq.MembersByTokens,
  [ ConfigModules.ExternalApiConfig,
    ExtApiModules.Requestor ],
  async (cfg: ConfigTypes.ExternalApiConfig,
    request: ExtApiTypes.Request): Promise<ExtApiTypes.AuthReq.MembersByTokens> =>

      async (tokens: string[]) => {
        const apiResp = await request({
          uri: `${cfg.authBaseUri}/internal/members`,
          method: ExtApiTypes.RequestMethod.GET,
          qs: { tokens }
        });
        console.log(apiResp);
        return [];
      });


injectable(ExtApiModules.AuthReq.MembersByNos,
  [ ConfigModules.ExternalApiConfig,
    ExtApiModules.Requestor ],
  async (cfg: ConfigTypes.ExternalApiConfig,
    request: ExtApiTypes.Request): Promise<ExtApiTypes.AuthReq.MembersByNos> =>

    async (memberNos: number[]) => {
      return [];
    });