import { injectable } from 'smart-factory';
import { MiddlewareModules } from './modules';
import { MiddlewareTypes } from './types';

injectable(MiddlewareModules.Authentication,
  [],
  async (): Promise<MiddlewareTypes.Authentication> =>
    (req, res, next) => {

    });