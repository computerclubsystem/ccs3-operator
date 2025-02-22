import { DeviceStatus } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface TransferDeviceReplyMessageBody {
  sourceDeviceStatus: DeviceStatus;
  targetDeviceStatus: DeviceStatus;
}

export type TransferDeviceReplyMessage = ReplyMessage<TransferDeviceReplyMessageBody>;
