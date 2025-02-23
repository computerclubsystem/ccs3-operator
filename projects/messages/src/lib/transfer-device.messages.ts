import { DeviceStatus } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface TransferDeviceRequestMessageBody {
  sourceDeviceId: number;
  targetDeviceId: number;
}

export type TransferDeviceRequestMessage = Message<TransferDeviceRequestMessageBody>;

export function createTransferDeviceRequestMessage(): TransferDeviceRequestMessage {
  const msg: TransferDeviceRequestMessage = {
    header: { type: MessageType.transferDeviceRequest },
    body: {} as TransferDeviceRequestMessageBody,
  };
  return msg;
}

export interface TransferDeviceReplyMessageBody {
  sourceDeviceStatus: DeviceStatus;
  targetDeviceStatus: DeviceStatus;
}

export type TransferDeviceReplyMessage = ReplyMessage<TransferDeviceReplyMessageBody>;

