import { get } from 'lodash';
import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { UtilModules, UtilTypes } from '../utils';
import { BaseSecurityError } from '../errors';

class AuthenticationFailError extends BaseSecurityError {}
class AuthorizationFailError extends BaseSecurityError {}

injectable(MiddlewareModules.Authentication,
  [ UtilModules.Auth.ValidateSessionKey ],
  async (validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authentication> =>

    (req, res, next) => {
      const sessionKey: string = req.query.session_key;
      if (!sessionKey) return next(new AuthenticationFailError('session_key not found'));

      const validated = validateSessionKey(sessionKey);
      if (validated.valid === false) return next(new AuthenticationFailError('invalid session_key'));
      if (validated.expired === true) return next(new AuthenticationFailError('invalid session_key')); // TODO: to be changed to SESSION_EXPIRED
      next();
    });

injectable(MiddlewareModules.Authorization,
  [ UtilModules.Auth.DecryptMemberToken,
    UtilModules.Auth.ValidateSessionKey ],
  async (decryptMemberToken: UtilTypes.Auth.DecryptMemberToken,
    validateSessionKey: UtilTypes.Auth.ValidateSessionKey): Promise<MiddlewareTypes.Authorization> =>

    (memberTokenPath: string[]) =>
      (req, res, next) => {
        const sessionKey: string = req.query.session_key;
        const memberToken: string = get(req.query, memberTokenPath);

        if (!sessionKey) return next(new AuthorizationFailError('session_key not supplied'));
        if (!memberToken) return next(new AuthorizationFailError('member_token not supplied'));

        const member = decryptMemberToken(memberToken);
        if (!member) return next(new AuthorizationFailError('invalid member_token'));

        const validated = validateSessionKey(sessionKey);
        if (validated.valid === false) return next(new AuthorizationFailError('invalid session_key'));
        if (validated.expired === true) return next(new AuthorizationFailError('invalid session_key')); // TODO: to be changed to SESSION_EXPIRED

        if (validated.member_no !== member.member_no) return next(new AuthorizationFailError('not allowed operation'));
        next();
      });