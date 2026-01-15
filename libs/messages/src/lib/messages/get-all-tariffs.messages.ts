import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Tariff, TariffType } from '../index-entities';

export interface GetAllTariffsRequestMessageBody {
  types?: TariffType[];
}

export type GetAllTariffsRequestMessage = Message<GetAllTariffsRequestMessageBody>;

export function createGetAllTariffsRequestMessage(): GetAllTariffsRequestMessage {
  const msg: GetAllTariffsRequestMessage = {
    header: { type: MessageType.getAllTariffsRequest },
    body: {} as GetAllTariffsRequestMessageBody,
  };
  return msg;
}

export interface GetAllTariffsReplyMessageBody {
  tariffs: Tariff[];
}

export type GetAllTariffsReplyMessage = ReplyMessage<GetAllTariffsReplyMessageBody>;
