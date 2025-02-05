import { DeviceStatus } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface StartDeviceReplyMessageBody {
  deviceStatus: DeviceStatus;
}

export type StartDeviceReplyMessage = ReplyMessage<StartDeviceReplyMessageBody> ;
