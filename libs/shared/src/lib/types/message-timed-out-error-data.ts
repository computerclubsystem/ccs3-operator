import { Message } from '@ccs3-operator/messages';

export interface MessageTimedOutErrorData {
  sentAt: number;
  message: Message<unknown>;
  timeout: number;
}
