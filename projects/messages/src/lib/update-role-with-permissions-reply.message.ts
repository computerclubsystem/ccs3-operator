import { Role } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface UpdateRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
}

export interface UpdateRoleWithPermissionsReplyMessage extends ReplyMessage<UpdateRoleWithPermissionsReplyMessageBody> {
}
