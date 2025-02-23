import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type SignOutRequestMessageBody = object;

export type SignOutRequestMessage = Message<SignOutRequestMessageBody>;

export function createSignOutRequestMessage(): SignOutRequestMessage {
  const msg: SignOutRequestMessage = {
    header: { type: MessageType.signOutRequest },
    body: {} as SignOutRequestMessageBody,
  };
  return msg;
}

export interface SignOutReplyMessageBody {
  sessionStart: number;
  sessionEnd: number;
  sentMessagesCount: number;
  receivedMessagesCount: number;
  sentPingMessagesCount: number;
}

export type SignOutReplyMessage = ReplyMessage<SignOutReplyMessageBody>;
