import { Message, MessageType } from '@ccs3-operator/messages';

export interface ForceSignOutAllUserSessionsRequestMessageBody {
  userId: number;
}

export interface ForceSignOutAllUserSessionsRequestMessage extends Message<ForceSignOutAllUserSessionsRequestMessageBody> {
}

export function createForceSignOutAllUserSessionsRequestMessage(): ForceSignOutAllUserSessionsRequestMessage {
  const msg: ForceSignOutAllUserSessionsRequestMessage = {
    header: {
      type: MessageType.forceSignOutAllUserSessionsRequest,
    },
    body: {} as ForceSignOutAllUserSessionsRequestMessageBody,
  };
  return msg;
}
