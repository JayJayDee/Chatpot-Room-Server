import { isArray } from 'util';
import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ModelModules, ModelTypes } from '../models';
import { InvalidParamError } from '../errors';
import { UtilModules, UtilTypes } from '../utils';


injectable(EndpointModules.Internal.Rooms,
  [ EndpointModules.Utils.WrapAync,
    ModelModules.Room.GetMultiple ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    getMultiple: ModelTypes.Room.GetMultiple): Promise<EndpointTypes.Endpoint> => ({
    uri: '/internal/rooms',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const roomNos = req.query['room_nos'];

        if (!roomNos) throw new InvalidParamError('room_nos required');

        let queryRoomNos: number[] = [];
        if (isArray(roomNos)) {
          queryRoomNos = roomNos;
        } else {
          queryRoomNos = [ roomNos ];
        }

        const rooms = await getMultiple(queryRoomNos);
        res.status(200).json(rooms);
      })
    ]
  }));


injectable(EndpointModules.Internal.MyRooms,
  [ EndpointModules.Utils.WrapAync,
    UtilModules.Auth.DecryptMemberToken,
    ModelModules.RoomMember.MyRooms ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    myRooms: ModelTypes.RoomMember.MyRooms): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/internal/:member_token/my',
      method: EndpointTypes.EndpointMethod.GET,
      handler: [
        wrapAsync(async (req, res, next) => {
          const memberToken = req.params.member_token;
          const member = decryptMemberToken(memberToken);

          if (member === null) throw new InvalidParamError('invalid member_token');

          const rooms = await myRooms(member.member_no);
          const roomTokens = rooms.map((r) => r.token);

          res.status(200).json(roomTokens);
        })
      ]
    }));