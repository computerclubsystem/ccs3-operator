import { Permission } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetAllPermissionsReplyMessageBody {
  permissions: Permission[];
}

export type GetAllPermissionsReplyMessage = ReplyMessage<GetAllPermissionsReplyMessageBody>;
