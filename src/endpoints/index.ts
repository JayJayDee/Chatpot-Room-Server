import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';

export { EndpointTypes } from './types';
export { EndpointModules } from './modules';

// register endpoints to container.
injectable(EndpointModules.Endpoints,
  [EndpointModules.Room.Create,
    EndpointModules.Room.List,
    EndpointModules.Room.Join,
    EndpointModules.Room.Leave,
    EndpointModules.My.Rooms,
    EndpointModules.Room.Members],

  async (create: EndpointTypes.Endpoint,
    list: EndpointTypes.Endpoint,
    join: EndpointTypes.Endpoint,
    leave: EndpointTypes.Endpoint,
    myRooms: EndpointTypes.Endpoint,
    members: EndpointTypes.Endpoint) =>

    ([
      create, list, join, leave, myRooms, members
    ]));