import { injectable } from 'smart-factory';

import { UtilModules } from './modules';
import { UtilTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

injectable(UtilModules.Auth.CrateRoomToken,
  [ ConfigModules.CredentialConfig ],
  async (cfg: ConfigTypes.CredentialConfig): Promise<UtilTypes.Auth.CreateRoomToken> =>
    (roomNo: number) => {
      return '';
    });

injectable(UtilModules.Auth.DecryptRoomToken,
  [ ConfigModules.CredentialConfig ],
  async (cfg: ConfigTypes.CredentialConfig): Promise<UtilTypes.Auth.DecryptRoomToken> =>
    (roomToken: string) => {
      return null;
    });