import { Role } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface UpdateRoleWithPermissionsRequestMessageBody {
  role: Role;
  rolePermissionIds: number[];
}

export interface UpdateRoleWithPermissionsRequestMessage extends Message<UpdateRoleWithPermissionsRequestMessageBody> {
}

export function createUpdateRoleWithPermissionsRequestMessage(): UpdateRoleWithPermissionsRequestMessage {
  const msg: UpdateRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.updateRoleWithPermissionsRequest },
    body: {} as UpdateRoleWithPermissionsRequestMessageBody,
  };
  return msg;
};
