export enum StorageKey {
  tokenData = 'ccs3-op-token-data',
}

export interface AppComponentState {
  pingTimerHandle: number;
  refreshTokenTimeHandle: number;
}
