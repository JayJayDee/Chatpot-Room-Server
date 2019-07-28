export namespace RouletteMatcherTypes {
  type MatchResult = {
    matched: boolean;
    request_ids: string[];
  };
  export type Match = () => Promise<MatchResult>;
  export type MatcherRunner = () => Promise<void>;
}