import { ReplyMessage } from './declarations/message';
import { Device } from './entities/device';

export interface UpdateDeviceReplyMessageBody {
  device?: Device;
}

export type UpdateDeviceReplyMessage = ReplyMessage<UpdateDeviceReplyMessageBody>;
