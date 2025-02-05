import { User } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type GetUserWithRolesReplyMessage = ReplyMessage<GetUserWithRolesReplyMessageBody>;
