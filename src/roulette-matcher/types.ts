export namespace RouletteMatcherTypes {
  export type Match = () => Promise<void>;
  export type CleanupCheckers = (roomNo: number) => Promise<void>;

  export type MatcherRunner = () => Promise<void>;
}