import { ReplyMessage } from './declarations/message';

export interface RechargeTariffDurationReplyMessageBody {
  remainingSeconds?: number;
}

export type RechargeTariffDurationReplyMessage = ReplyMessage<RechargeTariffDurationReplyMessageBody>;
