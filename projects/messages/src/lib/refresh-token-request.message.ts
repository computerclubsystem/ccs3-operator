import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface RefreshTokenRequestMessageBody {
  currentToken: string;
}

export type RefreshTokenRequestMessage = Message<RefreshTokenRequestMessageBody>;

export function createRefreshTokenRequestMessage(): RefreshTokenRequestMessage {
  const msg: RefreshTokenRequestMessage = {
    header: { type: MessageType.refreshTokenRequest },
    body: {} as RefreshTokenRequestMessageBody,
  };
  return msg;
};
