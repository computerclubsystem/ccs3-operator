import { Message } from './declarations/message';
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
};
