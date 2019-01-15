import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { UtilModules, UtilTypes } from '../utils';

injectable(MiddlewareModules.Authentication,
  [ UtilModules.Auth.DecryptMemberToken,
    UtilModules.Auth.ValidateSessionKey ],
  async (decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authentication> =>

    (req, res, next) => {
      next();
    });