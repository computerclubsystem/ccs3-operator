import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceGroup } from '../index-entities';

export type GetAllDeviceGroupsRequestMessageBody = object;

export type GetAllDeviceGroupsRequestMessage = Message<GetAllDeviceGroupsRequestMessageBody>;

export function createGetAllDeviceGroupsRequestMessage(): GetAllDeviceGroupsRequestMessage {
  const msg: GetAllDeviceGroupsRequestMessage = {
    header: { type: MessageType.getAllDeviceGroupsRequest },
    body: {},
  };
  return msg;
}

export interface GetAllDeviceGroupsReplyMessageBody {
  deviceGroups: DeviceGroup[];
};

export type GetAllDeviceGroupsReplyMessage = ReplyMessage<GetAllDeviceGroupsReplyMessageBody>;
