import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ExtApiModules, ExtApiTypes } from '../extapis';
import { ModelModules, ModelTypes } from '../models';

injectable(EndpointModules.Room.List,
  [ EndpointModules.Utils.WrapAync,
    ExtApiModules.AuthReq.MembersByNos,
    ModelModules.Room.List ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    getMembersByNos: ExtApiTypes.AuthReq.MembersByNos,
    getRooms: ModelTypes.Room.List): Promise<EndpointTypes.Endpoint> =>
  ({
    uri: '/rooms',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const rooms = await getRooms({});
        const memberNos = rooms.list.map((r) => r.owner_no);
        const members = await getMembersByNos(memberNos);
        console.log('members from api: ', members);
        console.log('rooms = ', rooms);
        res.status(200).json({});
      })
    ]
  }));

injectable(EndpointModules.Room.Create,
  [ EndpointModules.Utils.WrapAync ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync): Promise<EndpointTypes.Endpoint> => ({
    uri: '/room',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      wrapAsync(async (req, res, next) => {
        res.status(200).json({});
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