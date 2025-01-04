import { DeviceStatus } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetDeviceStatusesReplyMessageBody {
  deviceStatuses: DeviceStatus[];
}

export interface GetDeviceStatusesReplyMessage extends ReplyMessage<GetDeviceStatusesReplyMessageBody> {
}
