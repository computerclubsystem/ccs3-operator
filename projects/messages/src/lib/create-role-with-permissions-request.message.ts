import { Role } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface CreateRoleWithPermissionsRequestMessageBody {
  role: Role;
  rolePermissionIds: number[];
}

export interface CreateRoleWithPermissionsRequestMessage extends Message<CreateRoleWithPermissionsRequestMessageBody> {
}

export function createCreateRoleWithPermissionsRequestMessage(): CreateRoleWithPermissionsRequestMessage {
  const msg: CreateRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.createRoleWithPermissionsRequest },
    body: {} as CreateRoleWithPermissionsRequestMessageBody,
  };
  return msg;
};
