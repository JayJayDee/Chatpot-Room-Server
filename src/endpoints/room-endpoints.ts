import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';

injectable(EndpointModules.Room.List,
  [],
  async (): Promise<EndpointTypes.Endpoint> => ({
    uri: '/rooms',
    method: EndpointTypes.EndpointMethod.GET,
    handler: [
      (req, res, next) => {
        res.status(200).json({});
      }
    ]
  }));

injectable(EndpointModules.Room.Create,
  [],
  async (): Promise<EndpointTypes.Endpoint> => ({
    uri: '/room',
    method: EndpointTypes.EndpointMethod.POST,
    handler: [
      (req, res, next) => {
        res.status(200).json({});
      }
    ]
  }));