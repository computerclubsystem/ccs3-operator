import { ReplyMessage } from './declarations/message';
import { User } from './entities/user';

export interface GetAllUsersReplyMessageBody {
  users: User[];
}

export interface GetAllUsersReplyMessage extends ReplyMessage<GetAllUsersReplyMessageBody> {
}
