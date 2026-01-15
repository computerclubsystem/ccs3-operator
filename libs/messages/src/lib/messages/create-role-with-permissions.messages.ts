import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Role } from '../index-entities';

export interface CreateRoleWithPermissionsRequestMessageBody {
  role: Role;
  rolePermissionIds: number[];
}

export type CreateRoleWithPermissionsRequestMessage = Message<CreateRoleWithPermissionsRequestMessageBody>;

export function createCreateRoleWithPermissionsRequestMessage(): CreateRoleWithPermissionsRequestMessage {
  const msg: CreateRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.createRoleWithPermissionsRequest },
    body: {} as CreateRoleWithPermissionsRequestMessageBody,
  };
  return msg;
}

export interface CreateRoleWithPermissionsReplyMessageBody {
  role?: Role;
  rolePermissionIds?: number[];
}

export type CreateRoleWithPermissionsReplyMessage = ReplyMessage<CreateRoleWithPermissionsReplyMessageBody>;

