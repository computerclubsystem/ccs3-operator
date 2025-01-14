import { User } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface CreateUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export interface CreateUserWithRolesReplyMessage extends ReplyMessage<CreateUserWithRolesReplyMessageBody> {
}
