import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface SignOutRequestMessageBody {
}

export interface SignOutRequestMessage extends Message<SignOutRequestMessageBody> {
}

export function createSignOutRequestMessage(): SignOutRequestMessage {
  const msg: SignOutRequestMessage = {
    header: { type: MessageType.signOutRequest },
    body: {} as SignOutRequestMessageBody,
  };
  return msg;
};
