import { Message } from './declarations/message';
import { Device } from './entities/device';

export interface GetAllDevicesReplyMessageBody {
  devices: Device[];
}

export interface GetAllDevicesReplyMessage extends Message<GetAllDevicesReplyMessageBody> {
}
