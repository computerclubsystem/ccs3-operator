import { TariffType } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

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
};
