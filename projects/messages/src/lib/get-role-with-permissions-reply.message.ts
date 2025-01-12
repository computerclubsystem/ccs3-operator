import { Permission, Role } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface GetRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
  allPermissions?: Permission[];
}

export interface GetRoleWithPermissionsReplyMessage extends ReplyMessage<GetRoleWithPermissionsReplyMessageBody> {
}
