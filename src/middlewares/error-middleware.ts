import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';

injectable(MiddlewareModules.Error,
  [],
  async (): Promise<MiddlewareTypes.Error> =>
    (req, res, next) => {
      next();
    });