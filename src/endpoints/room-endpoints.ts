import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ServiceModules, ServiceTypes } from '../services';
import { InvalidParamError } from '../errors';
import { UtilModules } from '../utils/modules';
import { UtilTypes } from '../utils/types';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';

injectable(EndpointModules.Room.List,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.List,
    MiddlewareModules.Authentication ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    queryRooms: ServiceTypes.RoomService.List,
    authenticate: MiddlewareTypes.Authentication): Promise<EndpointTypes.Endpoint> =>
  ({
    uri: '/rooms',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      authenticate,
      wrapAsync(async (req, res, next) => {
        const rooms = await queryRooms({});
        res.status(200).json(rooms);
      })
    ]
  }));

injectable(EndpointModules.Room.Create,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.Create,
    UtilModules.Auth.DecryptMemberToken ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    create: ServiceTypes.RoomService.Create,
    decrypt: UtilTypes.Auth.DecryptMemberToken): Promise<EndpointTypes.Endpoint> => ({
    uri: '/room',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        const memberToken: string = req.body.member_token;
        const maxAttendee: string = req.body.max_attendee;
        const title: string = req.body.title;

        if (!memberToken || !maxAttendee || !title)
          throw new InvalidParamError('member_token, max_attendee, title required');
        if (decrypt(memberToken) === null)
          throw new InvalidParamError('invalid member_token');

        const resp = await create({
          title,
          owner_no: decrypt(memberToken).member_no,
          max_attendee: parseInt(maxAttendee)
        });
        res.status(200).json(resp);
      })
    ]
  }));

injectable(EndpointModules.Room.Join,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/room/:room_token/join',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        res.status(200).json({});
      })
    ]
  }));

injectable(EndpointModules.Room.Leave,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/room/:room_token/leave',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        res.status(200).json({});
      })
    ]
  }));