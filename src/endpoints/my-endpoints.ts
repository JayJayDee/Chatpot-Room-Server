import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';

injectable(EndpointModules.My.Rooms,
  [ EndpointModules.Utils.WrapAync,
    MiddlewareModules.Authorization ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    authorize: MiddlewareTypes.Authorization): Promise<EndpointTypes.Endpoint> =>
      ({
        uri: '/my/:member_token/rooms',
        method: EndpointTypes.EndpointMethod.GET,
        handler: [
          authorize(['params', 'member_token']),
          wrapAsync(async (req, res, next) => {
            // TODO: to be implemented.
            res.status(200).json([]);
          })
        ]
      }));