import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ServiceModules, ServiceTypes } from '../services';
import { InvalidParamError, BaseLogicError } from '../errors';
import { UtilModules } from '../utils/modules';
import { UtilTypes } from '../utils/types';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';
import { ModelTypes } from '../models';
import { CacheModules, CacheTypes } from '../cache';

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

            const rooms = await queryRooms({ offset, size, keyword, region }, order);
            res.status(200).json(rooms);
          })
        ]
      }));


class InvalidMaxAttendeeNumberError extends BaseLogicError {
  constructor() {
    super('INVALID_MAX_ATTENDEE', 'max_attendee must be 2 ~ 10');
  }
}

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

            let max_attendee: number = 0;
            try {
              max_attendee = parseInt(maxAttendee);
            } catch (err) {
              throw new InvalidParamError('max_attendee must be a number');
            }

            if (max_attendee > 10 || max_attendee < 2) {
              throw new InvalidMaxAttendeeNumberError();
            }

            const resp = await create({
              title,
              owner_no: decrypt(memberToken).member_no,
              owner_token: memberToken,
              max_attendee
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


class RoomNotFoundError extends BaseLogicError {
  constructor(msg: string) {
    super('ROOM_NOT_FOUND', msg);
  }
}

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
          if (roomDetail === null) {
            throw new RoomNotFoundError(`room not found for room_token:${roomToken}`);
          }
          res.status(200).json(roomDetail);
        })
      ]
    }));


type FeaturedRooms = {
  recent: ServiceTypes.Room[];
  crowded: ServiceTypes.Room[];
};

injectable(EndpointModules.Room.Featured,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.List,
    CacheModules.CachedOperation ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    queryRooms: ServiceTypes.RoomService.List,
    cached: CacheTypes.CachedOperation<FeaturedRooms>) =>

    ({
      uri: '/rooms/featured',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        wrapAsync(async (req, res, next) => {
          const resp = await cached('featured-rooms', async () => {
            const recent = (await queryRooms({
              offset: 0,
              size: 5
            }, ModelTypes.RoomOrder.REGDATE_DESC)).list;
            const crowded = (await queryRooms({
              offset: 0,
              size: 5
            }, ModelTypes.RoomOrder.ATTENDEE_DESC)).list;
            return { recent, crowded };
          });
          res.status(200).json(resp);
        })
      ]
    }));