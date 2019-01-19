import { injectable } from 'smart-factory';
import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { MiddlewareModules, MiddlewareTypes } from '../middlewares';
import { UtilModules, UtilTypes } from '../utils';
import { ServiceModules, ServiceTypes } from '../services';

injectable(EndpointModules.My.Rooms,
  [ EndpointModules.Utils.WrapAync,
    MiddlewareModules.Authorization,
    UtilModules.Auth.DecryptMemberToken,
    ServiceModules.My.Rooms ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    authorize: MiddlewareTypes.Authorization,
    decrypt: UtilTypes.Auth.DecryptMemberToken,
    getMyRooms: ServiceTypes.MyService.Rooms): Promise<EndpointTypes.Endpoint> =>

      ({
        uri: '/my/:member_token/rooms',
        method: EndpointTypes.EndpointMethod.GET,
        handler: [
          authorize(['params', 'member_token']),
          wrapAsync(async (req, res, next) => {
            const memberNo = decrypt(req.params['member_token']).member_no;
            const myRooms = await getMyRooms(memberNo);
            res.status(200).json(myRooms);
          })
        ]
      }));


injectable(EndpointModules.My.Join,
  [ EndpointModules.Utils.WrapAync,
    MiddlewareModules.Authorization,
    UtilModules.Auth.DecryptMemberToken ],
  async (wrapAsync: EndpointTypes.Utils.WrapAsync,
    authorize: MiddlewareTypes.Authorization,
    decrypt: UtilTypes.Auth.DecryptMemberToken): Promise<EndpointTypes.Endpoint> =>

    ({
      uri: '/my/:member_token/join',
      method: EndpointTypes.EndpointMethod.POST,
      handler: [
        authorize(['params', 'member_token']),
        wrapAsync(async (req, res, next) => {
          res.status(200).json({});
        })
      ]
    }));

