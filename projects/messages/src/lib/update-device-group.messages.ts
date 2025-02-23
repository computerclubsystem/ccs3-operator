import { DeviceGroup, Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface UpdateDeviceGroupRequestMessageBody {
  deviceGroup: DeviceGroup;
  assignedTariffIds?: number[] | null;
}

export type UpdateDeviceGroupRequestMessage = Message<UpdateDeviceGroupRequestMessageBody>;

export function createUpdateDeviceGroupRequestMessage(): UpdateDeviceGroupRequestMessage {
  const msg: UpdateDeviceGroupRequestMessage = {
    header: { type: MessageType.updateDeviceGroupRequest },
    body: {} as UpdateDeviceGroupRequestMessageBody,
  };
  return msg;
}

export interface UpdateDeviceGroupReplyMessageBody {
  deviceGroup: DeviceGroup;
}

export type UpdateDeviceGroupReplyMessage = ReplyMessage<UpdateDeviceGroupReplyMessageBody>;
