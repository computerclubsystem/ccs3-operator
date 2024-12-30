import { Message } from './declarations/message';

export interface Device {
  id: number;
  certificateThumbprint: string;
  ipAddress: string;
  name?: string;
  description?: string;
  createdAt: string;
  approved: boolean;
  enabled: boolean;
  deviceGroupId?: number;
}

export interface GetAllDevicesReplyMessageBody {
  devices: Device[];
}

export interface GetAllDevicesReplyMessage extends Message<GetAllDevicesReplyMessageBody> {
}
