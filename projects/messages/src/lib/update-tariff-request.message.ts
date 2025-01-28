import { Tariff } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface UpdateTariffRequestMessageBody {
  tariff: Tariff;
  passwordHash?: string;
}

export interface UpdateTariffRequestMessage extends Message<UpdateTariffRequestMessageBody> {
}

export function createUpdateTariffRequestMessage(): UpdateTariffRequestMessage {
  const msg: UpdateTariffRequestMessage = {
    header: { type: MessageType.updateTariffRequest },
    body: {} as UpdateTariffRequestMessageBody,
  };
  return msg;
};
