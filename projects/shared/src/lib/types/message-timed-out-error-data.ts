import { Message, MessageType } from '@ccs3-operator/messages';

export interface MessageTimedOutErrorData {
  sentAt: number;
  message: Message<any>;
  timeout: number;
}
