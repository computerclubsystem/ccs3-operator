import { Tariff } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface UpdateTariffReplyMessageBody {
  tariff?: Tariff;
}

export type UpdateTariffReplyMessage = ReplyMessage<UpdateTariffReplyMessageBody>;
