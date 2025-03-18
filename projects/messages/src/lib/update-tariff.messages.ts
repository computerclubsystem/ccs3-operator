import { Tariff } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface UpdateTariffRequestMessageBody {
  tariff: Tariff;
  passwordHash?: string;
  deviceGroupIds?: number[] | null;
}

export type UpdateTariffRequestMessage = Message<UpdateTariffRequestMessageBody>;

export function createUpdateTariffRequestMessage(): UpdateTariffRequestMessage {
  const msg: UpdateTariffRequestMessage = {
    header: { type: MessageType.updateTariffRequest },
    body: {} as UpdateTariffRequestMessageBody,
  };
  return msg;
}


export interface UpdateTariffReplyMessageBody {
  tariff?: Tariff;
}

export type UpdateTariffReplyMessage = ReplyMessage<UpdateTariffReplyMessageBody>;

