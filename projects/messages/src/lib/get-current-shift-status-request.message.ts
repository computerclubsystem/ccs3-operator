import { Message, MessageType } from '@ccs3-operator/messages';

export type GetCurrentShiftStatusRequestMessageBody = object;

export type GetCurrentShiftStatusRequestMessage = Message<GetCurrentShiftStatusRequestMessageBody>;

export function createGetCurrentShiftStatusRequestMessage(): GetCurrentShiftStatusRequestMessage {
  const msg: GetCurrentShiftStatusRequestMessage = {
    header: { type: MessageType.getCurrentShiftStatusRequest },
    body: {} as GetCurrentShiftStatusRequestMessageBody,
  };
  return msg;
}
