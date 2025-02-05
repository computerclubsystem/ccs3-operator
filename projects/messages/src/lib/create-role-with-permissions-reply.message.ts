import { Role } from '@ccs3-operator/messages';
import { ReplyMessage } from './declarations/message';

export interface CreateRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
}

export type CreateRoleWithPermissionsReplyMessage = ReplyMessage<CreateRoleWithPermissionsReplyMessageBody>;
