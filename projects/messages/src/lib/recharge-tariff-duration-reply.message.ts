import { ReplyMessage } from './declarations/message';

export interface RechargeTariffDurationReplyMessageBody {
  remainingSeconds?: number;
}

export interface RechargeTariffDurationReplyMessage extends ReplyMessage<RechargeTariffDurationReplyMessageBody> {
}
