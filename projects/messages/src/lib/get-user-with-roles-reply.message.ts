import { User } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export interface GetUserWithRolesReplyMessage extends ReplyMessage<GetUserWithRolesReplyMessageBody> {
}
