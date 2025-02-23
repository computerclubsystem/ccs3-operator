import { Message, MessageType, ReplyMessage, Shift, ShiftsSummary } from '@ccs3-operator/messages';

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
