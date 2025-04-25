import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

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
    validTo: number;
}

export type CreateSignInCodeReplyMessage = ReplyMessage<CreateSignInCodeReplyMessageBody>;
