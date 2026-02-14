export const GlobalBulkActionId = {
  shutdownStopped: 'shutdownStopped',
  // restartStopped = 'restartStopped',
} as const;
export type GlobalBulkActionId = (typeof GlobalBulkActionId)[keyof typeof GlobalBulkActionId];

// TODO: Add interfaces for the different actions
export type GlobalActionData = object;

export interface GlobalBulkActionData {
  globalActionId: GlobalBulkActionId;
  data?: GlobalActionData | null;
}

export const BulkActionId = {
  setNote: 'setNote',
  restart: 'restart',
  start: 'start',
  shutdown: 'shutdown',
} as const;
export type BulkActionId = (typeof BulkActionId)[keyof typeof BulkActionId];

export interface BulkActionSetNoteData {
  note: string | null;
}

export interface BulkActionStartData {
  tariffId: number;
}

export type ActionData =
  BulkActionSetNoteData
  | BulkActionStartData;

export interface BulkActionData {
  actionId: BulkActionId;
  deviceIds: number[];
  data?: ActionData | null;
}

