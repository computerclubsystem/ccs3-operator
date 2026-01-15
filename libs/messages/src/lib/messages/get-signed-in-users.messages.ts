import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { SignedInUser } from '../index-entities';

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
