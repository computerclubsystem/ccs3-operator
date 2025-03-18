import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface GetTariffDeviceGroupsRequestMessageBody {
    tariffId: number;
}

export type GetTariffDeviceGroupsRequestMessage = Message<GetTariffDeviceGroupsRequestMessageBody>;

export function createGetTariffDeviceGroupsRequestMessage(): GetTariffDeviceGroupsRequestMessage {
    const msg: GetTariffDeviceGroupsRequestMessage = {
        header: { type: MessageType.getTariffDeviceGroupsRequest },
        body: {} as GetTariffDeviceGroupsRequestMessageBody,
    };
    return msg;
};


export interface GetTariffDeviceGroupsReplyMessageBody {
    deviceGroupIds: number[];
}

export type GetTariffDeviceGroupsReplyMessage = ReplyMessage<GetTariffDeviceGroupsReplyMessageBody>;
