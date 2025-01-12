import { Role } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface CreateRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
}

export interface CreateRoleWithPermissionsReplyMessage extends ReplyMessage<CreateRoleWithPermissionsReplyMessageBody> {
}
