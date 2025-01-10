import { Tariff } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface UpdateTariffReplyMessageBody {
  tariff?: Tariff;
}

export interface UpdateTariffReplyMessage extends ReplyMessage<UpdateTariffReplyMessageBody> {
}
