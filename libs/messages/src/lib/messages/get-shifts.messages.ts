import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Shift, ShiftsSummary } from '../index-entities';

export interface GetShiftsRequestMessageBody {
  fromDate: string;
  toDate: string;
  userId?: number | null;
}

export type GetShiftsRequestMessage = Message<GetShiftsRequestMessageBody>;

export function createGetShiftsRequestMessage(): GetShiftsRequestMessage {
  const msg: GetShiftsRequestMessage = {
    header: { type: MessageType.getShiftsRequest },
    body: {} as GetShiftsRequestMessageBody,
  };
  return msg;
}

export interface GetShiftsReplyMessageBody {
  shifts: Shift[];
  shiftsSummary: ShiftsSummary;
}

export type GetShiftsReplyMessage = ReplyMessage<GetShiftsReplyMessageBody>;
