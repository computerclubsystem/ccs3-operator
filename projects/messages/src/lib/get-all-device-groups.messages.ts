import { DeviceGroup, Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

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
