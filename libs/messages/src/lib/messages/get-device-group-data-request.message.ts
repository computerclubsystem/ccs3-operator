import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceGroupData } from '../index-entities';

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
