import { MessageType, Message, ReplyMessage } from '../index-declarations';

export interface AuthRequestMessageBody {
  username?: string;
  passwordHash?: string;
  token?: string;
}

export type AuthRequestMessage = Message<AuthRequestMessageBody>;

export function createAuthRequestMessage(): AuthRequestMessage {
  const msg: AuthRequestMessage = {
    header: { type: MessageType.authRequest },
    body: {}
  };
  return msg;
};


export interface AuthReplyMessageBody {
  success: boolean;
  token?: string;
  permissions?: string[];
  tokenExpiresAt?: number;
}

export type AuthReplyMessage = ReplyMessage<AuthReplyMessageBody>;
