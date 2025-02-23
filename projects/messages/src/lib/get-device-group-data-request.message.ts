import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';
import { DeviceGroupData } from './entities/device-group-data';

export interface GetDeviceGroupDataRequestMessageBody {
    deviceGroupId: number;
}

export type GetDeviceGroupDataRequestMessage = Message<GetDeviceGroupDataRequestMessageBody>;

export function createGetDeviceGroupDataRequestMessage(): GetDeviceGroupDataRequestMessage {
    const msg: GetDeviceGroupDataRequestMessage = {
        header: { type: MessageType.getDeviceGroupDataRequest },
        body: {} as GetDeviceGroupDataRequestMessageBody,
    };
    return msg;
}

export interface GetDeviceGroupDataReplyMessageBody {
  deviceGroupData: DeviceGroupData;
}

export type GetDeviceGroupDataReplyMessage = ReplyMessage<GetDeviceGroupDataReplyMessageBody>;
