import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { CodeSignInIdentifierType } from '../index-entities';

export type CreateSignInCodeRequestMessageBody = object;

export type CreateSignInCodeRequestMessage = Message<CreateSignInCodeRequestMessageBody>;

export function createCreateSignInCodeRequestMessage(): CreateSignInCodeRequestMessage {
  const msg: CreateSignInCodeRequestMessage = {
      header: { type: MessageType.createSignInCodeRequest },
      body: {},
  };
  return msg;
}


export interface CreateSignInCodeReplyMessageBody {
    code: string;
    url: string;
    identifierType: CodeSignInIdentifierType;
    remainingSeconds: number;
}

export type CreateSignInCodeReplyMessage = ReplyMessage<CreateSignInCodeReplyMessageBody>;
