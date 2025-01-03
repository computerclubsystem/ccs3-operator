import { Tariff } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface CreateTariffRequestMessageBody {
  tariff: Tariff;
}

export interface CreateTariffRequestMessage extends Message<CreateTariffRequestMessageBody> {
}

export function createCreateTariffRequestMessage(): CreateTariffRequestMessage {
  const msg: CreateTariffRequestMessage = {
    header: { type: MessageType.createTariffRequest },
    body: {} as CreateTariffRequestMessageBody,
  };
  return msg;
};
