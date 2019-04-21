import { injectable } from 'smart-factory';
import { ExtApiModules } from './modules';
import { ExtApiTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';

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


injectable(ExtApiModules.MessageReq.PublishNotification,
  [ ExtApiModules.Requestor,
    ConfigModules.ExternalApiConfig,
    LoggerModules.Logger ],
  async (request: ExtApiTypes.Request,
    cfg: ConfigTypes.ExternalApiConfig,
    log: LoggerTypes.Logger): Promise<ExtApiTypes.MessageReq.PublishNotification> =>

    async (roomToken, notification) => {
      const uri = `${cfg.messageBaseUri}/internal/room/${roomToken}/notification`;
      const content = {
        notification_type: notification.action,
        member: notification.member,
        room_token: roomToken
      };

      const body = {
        content: JSON.stringify(content),
        room_token: roomToken,
        title_key: notification.action,
        subtitle: notification.roomTitle
      };

      log.debug(`[extapi-message] ${uri}, body-payload`);
      log.debug(body);

      await request({
        uri,
        method: ExtApiTypes.RequestMethod.POST,
        body
      });
    });