export type PostOverlayControlBody = { action: 'play' | 'stop' };
export type PostOverlayControlResponse = {
  revision: number;
  status: 'playing' | 'stopped';
};

export type OverlayKey = 'rank-chat' | 'rank-donation';

export type DotPath<T> = T extends object
  ? {
      [K in Extract<keyof T, string>]: NonNullable<T[K]> extends object
        ? NonNullable<T[K]> extends readonly unknown[]
          ? K
          : K | `${K}.${DotPath<NonNullable<T[K]>>}`
        : K;
    }[Extract<keyof T, string>]
  : never;

export type DotPathValue<
  T,
  P extends string,
> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? DotPathValue<NonNullable<T[K]>, R>
    : never
  : P extends keyof T
    ? T[P]
    : never;
