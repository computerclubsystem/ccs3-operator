import { ReplyMessage } from './declarations/message';
import { Device } from './entities/device';

export interface GetDeviceByIdReplyMessageBody {
  device: Device;
}

export type GetDeviceByIdReplyMessage = ReplyMessage<GetDeviceByIdReplyMessageBody>;
