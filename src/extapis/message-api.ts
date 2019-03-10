import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ExtApiTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

injectable(ExtApiModules.MessageReq.EnterRoom,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.MessageReq.EnterRoom> =>

    async (memberToken, roomToken) => {
      const uri = `${cfg.messageBaseUri}/internal/enter`;
      await request({
        uri,
        method: ExtApiTypes.RequestMethod.POST,
        body: {
          member_token: memberToken,
          room_token: roomToken
        }
      });
    });


injectable(ExtApiModules.MessageReq.LeaveRoom,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.MessageReq.LeaveRoom> =>

    async (memberToken, roomToken) => {
      const uri = `${cfg.messageBaseUri}/internal/leave`;
      await request({
        uri,
        method: ExtApiTypes.RequestMethod.POST,
        body: {
          member_token: memberToken,
          room_token: roomToken
        }
      });
    });