import { injectable } from 'smart-factory';
import * as express from 'express';
import { Application } from 'express';

import { EndpointModules } from './modules';
import { EndpointTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(EndpointModules.EndpointRunner,
  [ConfigModules.HttpConfig,
    LoggerModules.Logger,
    EndpointModules.Endpoints],

  async (cfg: ConfigTypes.HttpConfig,
    log: LoggerTypes.Logger,
    endpoints: EndpointTypes.Endpoint[]): Promise<EndpointTypes.EndpointRunner> =>

    () => {
      const app = express();
      registerEndpoints(app, endpoints, log);
      app.listen(cfg.port, () => {
        log.info(`[http] http server stared with port: ${cfg.port}`);
      });
    });

const registerEndpoints =
  (app: Application,
    endpoints: EndpointTypes.Endpoint[],
    log: LoggerTypes.Logger) => {
    endpoints.map((e) => {
      log.info(`[http] endpoint registered: ${e.method} ${e.uri}`);
    });
  };