import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface NotAuthenticatedMessageBody {
  requestedMessageType: MessageType;
}

export type NotAuthenticatedMessage = Message<NotAuthenticatedMessageBody>;
