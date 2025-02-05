import { Message } from './declarations/message';
import { Device } from './entities/device';

export interface GetDeviceByIdReplyMessageBody {
  device: Device;
}

export type GetDeviceByIdReplyMessage = Message<GetDeviceByIdReplyMessageBody>;
