import { injectable } from 'smart-factory';
import { ExternalModules } from './modules';
import { ConfigModules, ConfigTypes } from '../configs';
import { ExternalTypes } from './types';

injectable(ExternalModules.AuthApi.MembersByTokens,
  [ ConfigModules.ExternalApiConfig ],

  async (cfg: ConfigTypes.ExternalApiConfig
    ): Promise<ExternalTypes.AuthApi.MembersByTokens> =>

    async (tokens: string[]) => {
      return [];
    });

injectable(ExternalModules.AuthApi.MembersByNos,
  [ ConfigModules.ExternalApiConfig ],

  async (cfg: ConfigTypes.ExternalApiConfig
    ): Promise<ExternalTypes.AuthApi.MembersByNos> =>

    async (memberNos: number[]) => {
      return [];
    });