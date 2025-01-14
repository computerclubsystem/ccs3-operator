import { Tariff } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetTariffByIdReplyMessageBody {
  tariff?: Tariff;
}

export interface GetTariffByIdReplyMessage extends ReplyMessage<GetTariffByIdReplyMessageBody> {
}
