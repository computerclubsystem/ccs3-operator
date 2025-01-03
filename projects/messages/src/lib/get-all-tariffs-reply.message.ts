import { Message } from './declarations/message';
import { Tariff } from './entities/tariff';

export interface GetAllTariffsReplyMessageBody {
  tariffs: Tariff[];
}

export interface GetAllTariffsReplyMessage extends Message<GetAllTariffsReplyMessageBody> {
}
