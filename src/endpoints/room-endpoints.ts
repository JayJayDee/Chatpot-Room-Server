import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ServiceModules, ServiceTypes } from '../services';

injectable(EndpointModules.Room.List,
  [ EndpointModules.Utils.WrapAync,
    ServiceModules.Room.List ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    queryRooms: ServiceTypes.RoomService.List): Promise<EndpointTypes.Endpoint> =>
  ({
    uri: '/rooms',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      wrapAsync(async (req, res, next) => {
        const rooms = await queryRooms({});
        res.status(200).json(rooms);
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