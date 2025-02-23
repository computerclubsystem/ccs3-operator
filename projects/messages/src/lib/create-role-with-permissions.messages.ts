import { Role } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

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

