export enum GlobalBulkActionId {
  shutdownStopped = 'shutdownStopped',
  restartStopped = 'restartStopped',
}

// TODO: Add interfaces for the different actions
export type GlobalActionData = object;

export interface GlobalBulkActionData {
  globalActionId: GlobalBulkActionId;
  data?: GlobalActionData | null;
}

export enum BulkActionId {
  setNote = 'setNote',
  start = 'start',
}

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

