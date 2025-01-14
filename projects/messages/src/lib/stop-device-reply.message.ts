import { DeviceStatus } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface StopDeviceReplyMessageBody {
  deviceStatus: DeviceStatus;
}

export interface StopDeviceReplyMessage extends ReplyMessage<StopDeviceReplyMessageBody> {
}
