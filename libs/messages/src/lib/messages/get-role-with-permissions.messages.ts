import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Permission, Role } from '../index-entities';

export interface GetRoleWithPermissionsRequestMessageBody {
  roleId: number;
}

export type GetRoleWithPermissionsRequestMessage = Message<GetRoleWithPermissionsRequestMessageBody>;

export function createGetRoleWithPermissionsRequestMessage(): GetRoleWithPermissionsRequestMessage {
  const msg: GetRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.getRoleWithPermissionsRequest },
    body: {} as GetRoleWithPermissionsRequestMessageBody,
  };
  return msg;
}

export interface GetRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
  allPermissions?: Permission[];
}

export type GetRoleWithPermissionsReplyMessage = ReplyMessage<GetRoleWithPermissionsReplyMessageBody>;

