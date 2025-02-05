import { Message } from './declarations/message';

export interface RefreshTokenReplyMessageBody {
  success: boolean;
  token?: string;
  tokenExpiresAt?: number;
}

export type RefreshTokenReplyMessage = Message<RefreshTokenReplyMessageBody>;
