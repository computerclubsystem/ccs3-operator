import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface AuthRequestMessageBody {
  username?: string;
  passwordHash?: string;
  token?: string;
}

export interface AuthRequestMessage extends Message<AuthRequestMessageBody> {
}

export function createAuthRequestMessage(): AuthRequestMessage {
  const msg: AuthRequestMessage = {
    header: { type: MessageType.authRequest },
    body: {}
  };
  return msg;
};
