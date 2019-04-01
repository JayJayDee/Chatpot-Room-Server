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


injectable(ExtApiModules.MessageReq.LastMessages,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.MessageReq.LastMessages> =>

    async (roomTokens) => {
      if (roomTokens.length === 0) return {};
      const uri = `${cfg.messageBaseUri}/internal/lasts`;
      const resps = await request({
        uri,
        method: ExtApiTypes.RequestMethod.GET,
        qs: {
          room_tokens: roomTokens
        }
      });
      return resps;
    });


injectable(ExtApiModules.MessageReq.PublishMessage,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig): Promise<ExtApiTypes.MessageReq.PublishMessage> =>

    async (roomToken, message) => {
      // TODO: message publish api call routine to be implemented.
    });