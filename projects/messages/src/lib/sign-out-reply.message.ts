import { Message } from './declarations/message';

export interface SignOutReplyMessageBody {
  sessionStart: number;
  sessionEnd: number;
  sentMessagesCount: number;
  receivedMessagesCount: number;
  sentPingMessagesCount: number;
}

export interface SignOutReplyMessage extends Message<SignOutReplyMessageBody> {
}
