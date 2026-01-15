import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Tariff } from '../index-entities';

export interface GetTariffByIdRequestMessageBody {
  tariffId: number;
}

export type GetTariffByIdRequestMessage = Message<GetTariffByIdRequestMessageBody>;

export function createGetTariffByIdRequestMessage(): GetTariffByIdRequestMessage {
  const msg: GetTariffByIdRequestMessage = {
    header: { type: MessageType.getTariffByIdRequest },
    body: {} as GetTariffByIdRequestMessageBody,
  };
  return msg;
}

export interface GetTariffByIdReplyMessageBody {
  tariff?: Tariff;
}

export type GetTariffByIdReplyMessage = ReplyMessage<GetTariffByIdReplyMessageBody>;

