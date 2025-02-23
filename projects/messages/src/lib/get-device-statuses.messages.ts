import { DeviceStatus } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetDeviceStatusesRequestMessageBody = object;

export type GetDeviceStatusesRequestMessage = Message<GetDeviceStatusesRequestMessageBody>;

export function createGetDeviceStatusesRequestMessage(): GetDeviceStatusesRequestMessage {
  const msg: GetDeviceStatusesRequestMessage = {
    header: { type: MessageType.getDeviceStatusesRequest },
    body: {} as GetDeviceStatusesRequestMessageBody,
  };
  return msg;
}

export interface GetDeviceStatusesReplyMessageBody {
  deviceStatuses: DeviceStatus[];
}

export type GetDeviceStatusesReplyMessage = ReplyMessage<GetDeviceStatusesReplyMessageBody>;
