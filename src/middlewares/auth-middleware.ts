import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { UtilModules, UtilTypes } from '../utils';
import { BaseSecurityError } from '../errors';

class AuthenticationFailError extends BaseSecurityError {}

injectable(MiddlewareModules.Authentication,
  [ UtilModules.Auth.ValidateSessionKey ],
  async (decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authentication> =>

    (req, res, next) => {
      if (!req.query.session_key) return next(new AuthenticationFailError('session_key not found'));
      // TODO: to be implemented
      next();
    });

injectable(MiddlewareModules.Authorization,
  [ UtilModules.Auth.DecryptMemberToken,
    UtilModules.Auth.ValidateSessionKey ],
  async (decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authorization> =>

    (memberTokenPath: string[]) =>
      (req, res, next) => {
        // TODO: to be implemented
        next();
      });