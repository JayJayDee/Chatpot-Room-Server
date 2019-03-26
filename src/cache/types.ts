export namespace CacheTypes {
  type Executor = () => Promise<any>;

  export type CachedOperation<T> = (key: string, executor: Executor) => Promise<T>;
}