import { ReplyMessage, ShiftStatus } from '@ccs3-operator/messages';

export interface GetCurrentShiftStatusReplyMessageBody {
  shiftStatus: ShiftStatus;
}

export type GetCurrentShiftStatusReplyMessage = ReplyMessage<GetCurrentShiftStatusReplyMessageBody>;
