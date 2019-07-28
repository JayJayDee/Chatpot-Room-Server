export namespace ConfigTypes {
  export type RootConfig = {
    http: HttpConfig;
    mysql: MysqlConfig;
    credential: CredentialConfig;
    extapi: ExternalApiConfig;
    cache: CacheConfig;
    kvStorage: KeyValueStorageConfig;
    roulette: RouletteConfig;
  };
  export type HttpConfig = {
    port: number;
  };
  export type MysqlConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
  };
  export type CredentialConfig = {
    authEnabled: boolean;
    sessionExpires: number;
    authSecret: string;
    roomSecret: string;
  };
  export type KeyValueStorageConfig = {
    provider: CacheProvider;
    redis?: RedisConfig;
  };
  export type CacheConfig = {
    enabled: boolean;
  };
  export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
  };
  export type ExternalApiConfig = {
    authBaseUri: string;
    messageBaseUri: string;
  };
  export type RouletteConfig = {
    runnerEnabled: boolean;
    runnerPeriod: number;
  };
  export enum CacheProvider {
    MEMORY = 'MEMORY', REDIS = 'REDIS'
  }
  export enum Env {
    DEV = 'DEV',
    PROD = 'PROD'
  }
  export type ConfigRule = {
    key: string;
    path: string[];
    defaultValue?: any;
  };
  export type ConfigSource = {[key: string]: any};
  export type ConfigReader = () => Promise<ConfigSource>;
  export type ConfigParser = (src: ConfigSource, rules: ConfigRule[]) => RootConfig;
  export type EnvReader = (src: ConfigSource) => Env;
}