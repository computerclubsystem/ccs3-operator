import { Tariff } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

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

