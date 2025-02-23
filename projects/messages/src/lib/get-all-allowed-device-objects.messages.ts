import { AllowedDeviceObjects, Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export type GetAllAllowedDeviceObjectsRequestMessageBody = object;

export type GetAllAllowedDeviceObjectsRequestMessage = Message<GetAllAllowedDeviceObjectsRequestMessageBody>;

export function createGetAllAllowedDeviceObjectsRequestMessage(): GetAllAllowedDeviceObjectsRequestMessage {
  const msg: GetAllAllowedDeviceObjectsRequestMessage = {
    header: { type: MessageType.getAllAllowedDeviceObjectsRequest },
    body: {},
  };
  return msg;
}

export interface GetAllAllowedDeviceObjectsReplyMessageBody {
  allowedDeviceObjects: AllowedDeviceObjects[];
}

export type GetAllAllowedDeviceObjectsReplyMessage = ReplyMessage<GetAllAllowedDeviceObjectsReplyMessageBody>;
