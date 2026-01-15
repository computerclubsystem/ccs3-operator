import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Tariff } from '../index-entities';

export interface CreatePrepaidTariffRequestMessageBody {
  tariff: Tariff;
  passwordHash: string;
  deviceGroupIds?: number[] | null;
}

export type CreatePrepaidTariffRequestMessage = Message<CreatePrepaidTariffRequestMessageBody>;

export function createCreatePrepaidTariffRequestMessage(): CreatePrepaidTariffRequestMessage {
  const msg: CreatePrepaidTariffRequestMessage = {
    header: { type: MessageType.createPrepaidTariffRequest },
    body: {} as CreatePrepaidTariffRequestMessageBody,
  };
  return msg;
}


export interface CreatePrepaidTariffReplyMessageBody {
  tariff: Tariff;
}

export type CreatePrepaidTariffReplyMessage = ReplyMessage<CreatePrepaidTariffReplyMessageBody>;
