import { injectable } from 'smart-factory';
import { CacheModules } from './modules';
import { KeyValueStorageModules, KeyValueStorageTypes } from '../kv-storage';
import { CacheTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';
import { LoggerModules, LoggerTypes } from '../loggers';

injectable(CacheModules.CachedOperation,
  [ LoggerModules.Logger,
    ConfigModules.CacheConfig,
    KeyValueStorageModules.Get,
    KeyValueStorageModules.Set ],
  async <T>(log: LoggerTypes.Logger,
    cfg: ConfigTypes.CacheConfig,
    kvGet: KeyValueStorageTypes.Get,
    kvSet: KeyValueStorageTypes.Set): Promise<CacheTypes.CachedOperation<T>> =>

    async <T>(key: string, executor: () => Promise<T>) => {
      if (cfg.enabled === false) {
        log.debug('[cache-ops] cache disabled');
        return await executor();
      }
      let resp: T = await kvGet(key);
      console.log(resp);
      if (resp) {
        log.debug(`[cache-ops] cache hit: ${key}`);
        return resp;
      }

      resp = await executor();
      log.debug(`[cache-ops] cache not hit, storing..: ${key}`);
      await kvSet(key, resp, 30);
      return resp;
    });