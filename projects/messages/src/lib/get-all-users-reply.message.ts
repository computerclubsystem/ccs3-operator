import { ReplyMessage } from './declarations/message';
import { User } from './entities/user';

export interface GetAllUsersReplyMessageBody {
  users: User[];
}

export type GetAllUsersReplyMessage = ReplyMessage<GetAllUsersReplyMessageBody>;
