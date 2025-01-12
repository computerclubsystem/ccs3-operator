import { Permission } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetAllPermissionsReplyMessageBody {
  permissions: Permission[];
}

export interface GetAllPermissionsReplyMessage extends ReplyMessage<GetAllPermissionsReplyMessageBody> {
}
