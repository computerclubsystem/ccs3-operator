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

