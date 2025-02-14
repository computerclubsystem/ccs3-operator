import { ReplyMessage } from './declarations/message';
import { Tariff } from './entities/tariff';

export interface CreatePrepaidTariffReplyMessageBody {
  tariff: Tariff;
}

export type CreatePrepaidTariffReplyMessage = ReplyMessage<CreatePrepaidTariffReplyMessageBody>;
