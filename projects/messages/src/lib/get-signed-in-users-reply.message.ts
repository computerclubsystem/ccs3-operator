import { ReplyMessage } from './declarations/message';
import { SignedInUser } from './entities/signed-in-user';

export interface GetSignedInUsersReplyMessageBody {
  signedInUsers: SignedInUser[];
}

export type GetSignedInUsersReplyMessage = ReplyMessage<GetSignedInUsersReplyMessageBody>;
