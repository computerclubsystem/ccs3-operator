import { ReplyMessage } from './declarations/message';

export interface AuthReplyMessageBody {
  success: boolean;
  token?: string;
  permissions?: string[];
  tokenExpiresAt?: number;
}

export type AuthReplyMessage = ReplyMessage<AuthReplyMessageBody>;
