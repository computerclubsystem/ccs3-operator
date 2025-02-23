import { Message, ReplyMessage } from './declarations/message';
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
}

export interface RefreshTokenReplyMessageBody {
  success: boolean;
  token?: string;
  tokenExpiresAt?: number;
}

export type RefreshTokenReplyMessage = ReplyMessage<RefreshTokenReplyMessageBody>;

