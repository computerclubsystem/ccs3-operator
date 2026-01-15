import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Shift, ShiftStatus } from '../index-entities';

export interface CompleteShiftRequestMessageBody {
  shiftStatus: ShiftStatus;
  note?: string | null;
}

export type CompleteShiftRequestMessage = Message<CompleteShiftRequestMessageBody>;

export function createCompleteShiftRequestMessage(): CompleteShiftRequestMessage {
  const msg: CompleteShiftRequestMessage = {
    header: { type: MessageType.completeShiftRequest },
    body: {} as CompleteShiftRequestMessageBody,
  };
  return msg;
}


export interface CompleteShiftReplyMessageBody {
  shift: Shift;
}

export type CompleteShiftReplyMessage = ReplyMessage<CompleteShiftReplyMessageBody>;
