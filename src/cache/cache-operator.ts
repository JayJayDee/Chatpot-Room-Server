import { injectable } from 'smart-factory';
import { CacheModules } from './modules';
import { KeyValueStorageModules, KeyValueStorageTypes } from '../kv-storage';
import { CacheTypes } from './types';
import { ConfigModules, ConfigTypes } from '../configs';

injectable(CacheModules.CachedOperation,
  [ ConfigModules.CacheConfig,
    KeyValueStorageModules.Get,
    KeyValueStorageModules.Set ],
  async <T>(cfg: ConfigTypes.CacheConfig,
    kvGet: KeyValueStorageTypes.Get,
    kvSet: KeyValueStorageTypes.Set): Promise<CacheTypes.CachedOperation<T>> =>

    async <T>(key: string, executor: () => Promise<T>) => {
      if (cfg.enabled === false) {
        return await executor();
      }
      const a: T = null;
      // TODO: do cached operations.
      return a;
    });