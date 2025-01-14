import { User } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface UpdateUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export interface UpdateUserWithRolesReplyMessage extends ReplyMessage<UpdateUserWithRolesReplyMessageBody> {
}
