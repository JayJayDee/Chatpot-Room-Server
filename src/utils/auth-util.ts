import { injectable } from 'smart-factory';
import { createCipher, createDecipher } from 'crypto';

import { UtilModules } from './modules';
import { UtilTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';

const cipher = (cfg: ConfigTypes.CredentialConfig) =>
  createCipher('des-ede3-cbc', cfg.secret);

const decipher = (cfg: ConfigTypes.CredentialConfig) =>
  createDecipher('des-ede3-cbc', cfg.secret);

injectable(UtilModules.Auth.CrateRoomToken,
  [ ConfigModules.CredentialConfig ],
  async (cfg: ConfigTypes.CredentialConfig): Promise<UtilTypes.Auth.CreateRoomToken> =>
    (roomNo: number) => {
      const cp = cipher(cfg);
      let encrypted: string = '';
      encrypted += cp.update(`${roomNo}|@|${Date.now()}`, 'utf8', 'hex');
      encrypted += cp.final('hex');
      return encrypted;
    });

injectable(UtilModules.Auth.DecryptRoomToken,
  [ LoggerModules.Logger,
    ConfigModules.CredentialConfig ],
  async (log: LoggerTypes.Logger,
    cfg: ConfigTypes.CredentialConfig): Promise<UtilTypes.Auth.DecryptRoomToken> =>
      (roomToken: string) => {
        const dp = decipher(cfg);
        try {
          let decrypted: string = dp.update(roomToken, 'hex', 'utf8');
          decrypted += dp.final('utf8');
          const splited: string[] = decrypted.split('|@|');
          if (splited.length !== 2) {
            log.error(`[authutil] invalid token, decryption successful, but invalid expression: ${roomToken}`);
            return null;
          }
          return {
            room_no: parseInt(splited[0]),
            timestamp: parseInt(splited[1])
          };
        } catch (err) {
          log.error(`[authutil] invalid token, decryption failure: ${roomToken}`);
          return null;
        }
      });