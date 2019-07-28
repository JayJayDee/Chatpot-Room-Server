export namespace RouletteMatcherTypes {
  export type Match = () => Promise<void>;
  export type MatcherRunner = () => Promise<void>;
}