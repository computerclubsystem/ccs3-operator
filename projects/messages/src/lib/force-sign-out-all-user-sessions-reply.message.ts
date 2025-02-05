import { ReplyMessage } from '@ccs3-operator/messages';

export interface ForceSignOutAllUserSessionsReplyMessageBody {
  sessionsCount: number;
  connectionsCount: number;
}

export type ForceSignOutAllUserSessionsReplyMessage = ReplyMessage<ForceSignOutAllUserSessionsReplyMessageBody>;
