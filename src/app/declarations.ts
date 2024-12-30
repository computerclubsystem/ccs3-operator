export enum StorageKey {
  authReplyMessage = 'ccs3-op-auth-reply-message',
}

export interface AppComponentState {
  pingTimerHandle: number;
  refreshTokenTimeHandle: number;
}
