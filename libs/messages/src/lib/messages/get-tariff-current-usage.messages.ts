import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceWithTariff } from '../entities/device-with-tariff';

export interface GetTariffCurrentUsageRequestMessageBody {
    tariffId: number;
}

export type GetTariffCurrentUsageRequestMessage = Message<GetTariffCurrentUsageRequestMessageBody>;

export function createGetTariffCurrentUsageRequestMessage(): GetTariffCurrentUsageRequestMessage {
    const msg: GetTariffCurrentUsageRequestMessage = {
        header: { type: MessageType.getTariffCurrentUsageRequest },
        body: {} as GetTariffCurrentUsageRequestMessageBody,
    };
    return msg;
};


export interface GetTariffCurrentUsageReplyMessageBody {
    devicesWithTariffs: DeviceWithTariff[];
}

export type GetTariffCurrentUsageReplyMessage = ReplyMessage<GetTariffCurrentUsageReplyMessageBody>;
