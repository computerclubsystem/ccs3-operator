import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface ForceSignOutAllUserSessionsRequestMessageBody {
  userId: number;
}

export type ForceSignOutAllUserSessionsRequestMessage = Message<ForceSignOutAllUserSessionsRequestMessageBody>;

export function createForceSignOutAllUserSessionsRequestMessage(): ForceSignOutAllUserSessionsRequestMessage {
  const msg: ForceSignOutAllUserSessionsRequestMessage = {
    header: {
      type: MessageType.forceSignOutAllUserSessionsRequest,
    },
    body: {} as ForceSignOutAllUserSessionsRequestMessageBody,
  };
  return msg;
}

export interface ForceSignOutAllUserSessionsReplyMessageBody {
  sessionsCount: number;
  connectionsCount: number;
}

export type ForceSignOutAllUserSessionsReplyMessage = ReplyMessage<ForceSignOutAllUserSessionsReplyMessageBody>;
