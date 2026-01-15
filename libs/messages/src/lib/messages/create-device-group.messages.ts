import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceGroup } from '../index-entities';

export interface CreateDeviceGroupRequestMessageBody {
  deviceGroup: DeviceGroup;
  assignedTariffIds: number[];
}

export type CreateDeviceGroupRequestMessage = Message<CreateDeviceGroupRequestMessageBody>;

export function createCreateDeviceGroupRequestMessage(): CreateDeviceGroupRequestMessage {
  const msg: CreateDeviceGroupRequestMessage = {
    header: { type: MessageType.createDeviceGroupRequest },
    body: {} as CreateDeviceGroupRequestMessageBody,
  };
  return msg;
}


export interface CreateDeviceGroupReplyMessageBody {
  deviceGroup: DeviceGroup;
}

export type CreateDeviceGroupReplyMessage = ReplyMessage<CreateDeviceGroupReplyMessageBody>;
