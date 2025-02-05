import { ReplyMessage } from './declarations/message';
import { Role } from './entities/role';

export interface GetAllRolesReplyMessageBody {
  roles: Role[];
}

export type GetAllRolesReplyMessage = ReplyMessage<GetAllRolesReplyMessageBody>;
