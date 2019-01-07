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