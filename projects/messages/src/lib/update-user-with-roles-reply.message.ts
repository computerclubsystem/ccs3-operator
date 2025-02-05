import { User } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface UpdateUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type UpdateUserWithRolesReplyMessage = ReplyMessage<UpdateUserWithRolesReplyMessageBody>;
