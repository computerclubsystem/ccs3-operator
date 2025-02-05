import { ReplyMessage, Shift } from '@ccs3-operator/messages';

export interface CompleteShiftReplyMessageBody {
  shift: Shift;
}

export type CompleteShiftReplyMessage = ReplyMessage<CompleteShiftReplyMessageBody>;
