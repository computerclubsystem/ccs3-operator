import { SignedInUser } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetSignedInUsersRequestMessageBody = object;

export type GetSignedInUsersRequestMessage = Message<GetSignedInUsersRequestMessageBody>;

export function createGetSignedInUsersRequestMessage(): GetSignedInUsersRequestMessage {
  const msg: GetSignedInUsersRequestMessage = {
    header: { type: MessageType.getSignedInUsersRequest },
    body: {} as GetSignedInUsersRequestMessageBody,
  };
  return msg;
}

export interface GetSignedInUsersReplyMessageBody {
  signedInUsers: SignedInUser[];
}

export type GetSignedInUsersReplyMessage = ReplyMessage<GetSignedInUsersReplyMessageBody>;
