import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { ShiftStatus } from '../index-entities';

export type GetCurrentShiftStatusRequestMessageBody = object;

export type GetCurrentShiftStatusRequestMessage = Message<GetCurrentShiftStatusRequestMessageBody>;

export function createGetCurrentShiftStatusRequestMessage(): GetCurrentShiftStatusRequestMessage {
  const msg: GetCurrentShiftStatusRequestMessage = {
    header: { type: MessageType.getCurrentShiftStatusRequest },
    body: {} as GetCurrentShiftStatusRequestMessageBody,
  };
  return msg;
}

export interface GetCurrentShiftStatusReplyMessageBody {
  shiftStatus: ShiftStatus;
}

export type GetCurrentShiftStatusReplyMessage = ReplyMessage<GetCurrentShiftStatusReplyMessageBody>;
