import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Tariff } from '../index-entities';

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

