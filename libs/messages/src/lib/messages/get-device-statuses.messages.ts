import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceStatus } from '../index-entities';

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
