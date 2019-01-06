export namespace ConfigTypes {
  export type RootConfig = {
    http: HttpConfig;
    mysql: MysqlConfig;
    cache: CacheConfig;
    credential: CredentialConfig;
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
    sessionExpires: number;
    secret: string;
  };
  export type CacheConfig = {
    enabled: boolean;
    provider: CacheProvider;
    redis?: RedisConfig;
  };
  export type RedisConfig = {
    host: string;
    port: number;
    password?: string;
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