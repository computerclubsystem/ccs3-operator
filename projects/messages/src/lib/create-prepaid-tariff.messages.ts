import { Tariff } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface CreatePrepaidTariffRequestMessageBody {
  tariff: Tariff;
  passwordHash: string;
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
