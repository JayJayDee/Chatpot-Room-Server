import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';
import { BaseLogicError } from '../errors';

injectable(MiddlewareModules.Error,
  [],
  async (): Promise<MiddlewareTypes.Error> =>
    (err, req, res, next) => {
      if (err) {
        res.status(statusCode(err)).json({
          code: code(err),
          message: message(err)
        });
        return;
      }
      next();
    });

const statusCode = (err: Error) =>
  err instanceof BaseLogicError ? 400 : 500;

const code = (err: Error) =>
  err instanceof BaseLogicError ? err.code : 'UNEXPECTED_ERROR';

const message = (err: Error) => err.message;