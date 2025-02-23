import { Message, MessageType, ReplyMessage, Shift, ShiftStatus } from '@ccs3-operator/messages';

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
