import { Tariff } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface CreateTariffRequestMessageBody {
  tariff: Tariff;
  passwordHash: string;
  deviceGroupIds?: number[] | null;
}

export type CreateTariffRequestMessage = Message<CreateTariffRequestMessageBody>;

export function createCreateTariffRequestMessage(): CreateTariffRequestMessage {
  const msg: CreateTariffRequestMessage = {
    header: { type: MessageType.createTariffRequest },
    body: {} as CreateTariffRequestMessageBody,
  };
  return msg;
}

export interface CreateTariffReplyMessageBody {
  tariff: Tariff;
}

export type CreateTariffReplyMessage = ReplyMessage<CreateTariffReplyMessageBody>;
