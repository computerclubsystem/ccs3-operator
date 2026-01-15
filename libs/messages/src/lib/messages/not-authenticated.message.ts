import { Message, MessageType } from '../index-declarations';

export interface NotAuthenticatedMessageBody {
  requestedMessageType: MessageType;
}

export type NotAuthenticatedMessage = Message<NotAuthenticatedMessageBody>;
