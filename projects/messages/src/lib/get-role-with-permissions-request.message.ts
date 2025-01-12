import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetRoleWithPermissionsRequestMessageBody {
  roleId: number;
}

export interface GetRoleWithPermissionsRequestMessage extends Message<GetRoleWithPermissionsRequestMessageBody> {
}

export function createGetRoleWithPermissionsRequestMessage(): GetRoleWithPermissionsRequestMessage {
  const msg: GetRoleWithPermissionsRequestMessage = {
    header: { type: MessageType.getRoleWithPermissionsRequest },
    body: {} as GetRoleWithPermissionsRequestMessageBody,
  };
  return msg;
};
