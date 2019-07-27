import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';

export { EndpointTypes } from './types';
export { EndpointModules } from './modules';

// register endpoints to container.
injectable(EndpointModules.Endpoints,
  [EndpointModules.Room.Create,
    EndpointModules.Room.List,
    EndpointModules.Room.Featured,
    EndpointModules.Room.Join,
    EndpointModules.Room.Leave,
    EndpointModules.My.Rooms,
    EndpointModules.Room.Get,
    EndpointModules.Internal.Rooms,
    EndpointModules.Internal.MyRooms,
    EndpointModules.Roulette.Request,
    EndpointModules.Roulette.Status],

  async (create: EndpointTypes.Endpoint,
    list: EndpointTypes.Endpoint,
    featured: EndpointTypes.Endpoint,
    join: EndpointTypes.Endpoint,
    leave: EndpointTypes.Endpoint,
    myRooms: EndpointTypes.Endpoint,
    get: EndpointTypes.Endpoint,
    internalRooms: EndpointTypes.Endpoint,
    internalMyRooms: EndpointTypes.Endpoint,
    request: EndpointTypes.Endpoint,
    status: EndpointTypes.Endpoint) =>

    ([
      create, list, featured, join,
      leave, myRooms, get,
      internalRooms, internalMyRooms,
      request, status
    ]));