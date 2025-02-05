import { ReplyMessage } from './declarations/message';
import { Tariff } from './entities/tariff';

export interface CreateTariffReplyMessageBody {
  tariff: Tariff;
}

export type CreateTariffReplyMessage = ReplyMessage<CreateTariffReplyMessageBody>;
