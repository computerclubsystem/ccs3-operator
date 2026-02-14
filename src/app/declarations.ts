export const StorageKey = {
  tokenData: 'ccs3-op-token-data',
} as const;
export type StorageKey = (typeof StorageKey)[keyof typeof StorageKey];

export interface AppComponentState {
  pingTimerHandle: number;
  refreshTokenTimeHandle: number;
}
