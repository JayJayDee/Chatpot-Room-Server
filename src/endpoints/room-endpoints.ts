import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ServiceModules, ServiceTypes } from '../services';
import { InvalidParamError } from '../errors';
import { UtilModules } from '../utils/modules';
import { UtilTypes } from '../utils/types';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';
import { ModelTypes } from '../models';

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
          wrapAsync(async (req, res, next) => {
            const offsetExpr = req.query['offset'];
            const sizeExpr = req.query['size'];
            const order = req.query['order'];
            const keyword = req.query['keyword'];
            const region = req.query['region'];

            let offset: number = null;
            let size: number = null;

            try {
              if (offsetExpr && sizeExpr) {
                offset = parseInt(offsetExpr);
                size = parseInt(sizeExpr);
              }
            } catch (err) {
              throw new InvalidParamError('offset, size must be number');
            }

            const rooms = await queryRooms({ offset, size, order, keyword, region });
            res.status(200).json(rooms);
          })
        ]
      }));

injectable(EndpointModules.Room.Create,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.Create,
    UtilModules.Auth.DecryptMemberToken,
    MiddlewareModules.Authorization ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    create: ServiceTypes.RoomService.Create,
    decrypt: UtilTypes.Auth.DecryptMemberToken,
    authorize: MiddlewareTypes.Authorization): Promise<EndpointTypes.Endpoint> =>
      ({
        uri: '/room',
        method: EndpointTypes.EndpointMethod.POST,
        handler: [
          authorize(['body', 'member_token']),
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
              owner_token: memberToken,
              max_attendee: parseInt(maxAttendee)
            });
            res.status(200).json(resp);
          })
        ]
      }));

injectable(EndpointModules.Room.Join,
  [ EndpointModules.Utils.WrapAync,
    MiddlewareModules.Authorization,
    UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    ServiceModules.Room.Join ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    authorize: MiddlewareTypes.Authorization,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    joinRoom: ServiceTypes.RoomService.Join): Promise<EndpointTypes.Endpoint> =>
      ({
        uri: '/room/:room_token/join',
        method: EndpointTypes.EndpointMethod.POST,
        handler: [
          authorize(['body', 'member_token']),
          wrapAsync(async (req, res, next) => {
            const memberToken = req.body.member_token;
            const roomToken = req.params.room_token;
            if (!memberToken || !roomToken) throw new InvalidParamError('member_token required');

            const member = decryptMemberToken(memberToken);
            const room = decryptRoomToken(roomToken);

            if (!member) throw new InvalidParamError('invalid member_token');
            if (!room) throw new InvalidParamError('invalid room_token');

            await joinRoom({
              member_no: member.member_no,
              member_token: memberToken,
              room_no: room.room_no,
              room_token: roomToken
            });
            res.status(200).json({});
          })
        ]
      }));

injectable(EndpointModules.Room.Leave,
  [ EndpointModules.Utils.WrapAync,
    MiddlewareModules.Authorization,
    UtilModules.Auth.DecryptRoomToken,
    UtilModules.Auth.DecryptMemberToken,
    ServiceModules.Room.Leave ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    authorize: MiddlewareTypes.Authorization,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    leaveFromRoom: ServiceTypes.RoomService.Leave): Promise<EndpointTypes.Endpoint> =>
      ({
        uri: '/room/:room_token/leave',
        method: EndpointTypes.EndpointMethod.POST,
        handler: [
          authorize(['body', 'member_token']),
          wrapAsync(async (req, res, next) => {
            const memberToken = req.body.member_token;
            const roomToken = req.params.room_token;
            if (!memberToken || !roomToken) throw new InvalidParamError('member_token required');

            const member = decryptMemberToken(memberToken);
            const room = decryptRoomToken(roomToken);

            if (!member) throw new InvalidParamError('invalid member_token');
            if (!room) throw new InvalidParamError('invalid room_token');

            await leaveFromRoom({
              member_no: member.member_no,
              member_token: memberToken,
              room_no: room.room_no,
              room_token: roomToken
            });
            res.status(200).json({});
          })
        ]
      }));

injectable(EndpointModules.Room.Get,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptRoomToken,
    ServiceModules.Room.Get,
    MiddlewareModules.Authentication ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptRoomToken: UtilTypes.Auth.DecryptRoomToken,
    getRoomDetail: ServiceTypes.RoomService.Get,
    authenticate: MiddlewareTypes.Authentication): Promise<EndpointTypes.Endpoint> =>
    ({
      uri: '/room/:room_token',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        authenticate,
        wrapAsync(async (req, res, next) => {
          const roomToken = req.params['room_token'];
          if (!roomToken) throw new InvalidParamError('room_token');

          const room = decryptRoomToken(roomToken);
          if (!room) throw new InvalidParamError('invalid room_token');

          const roomDetail = await getRoomDetail(room.room_no);
          res.status(200).json(roomDetail);
        })
      ]
    }));


injectable(EndpointModules.Room.Featured,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.List ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    queryRooms: ServiceTypes.RoomService.List) =>

    ({
      uri: '/rooms/featured',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        wrapAsync(async (req, res, next) => {
          const recent = (await queryRooms({
            offset: 0,
            size: 5
          }, ModelTypes.RoomOrder.REGDATE_DESC)).list;

          const crowded = (await queryRooms({
            offset: 0,
            size: 5
          }, ModelTypes.RoomOrder.ATTENDEE_DESC)).list;

          res.status(200).json({ recent, crowded });
        })
      ]
    }));