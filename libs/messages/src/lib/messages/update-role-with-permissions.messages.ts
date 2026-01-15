import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Role } from '../index-entities';

export interface UpdateRoleWithPermissionsRequestMessageBody {
  role: Role;
  rolePermissionIds: number[];
}

export type UpdateRoleWithPermissionsRequestMessage = Message<UpdateRoleWithPermissionsRequestMessageBody>;

export function createUpdateRoleWithPermissionsRequestMessage(): UpdateRoleWithPermissionsRequestMessage {
  const msg: UpdateRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.updateRoleWithPermissionsRequest },
    body: {} as UpdateRoleWithPermissionsRequestMessageBody,
  };
  return msg;
}

export interface UpdateRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
}

export type UpdateRoleWithPermissionsReplyMessage = ReplyMessage<UpdateRoleWithPermissionsReplyMessageBody>;
