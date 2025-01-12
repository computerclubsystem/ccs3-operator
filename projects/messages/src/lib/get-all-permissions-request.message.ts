import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetAllPermissionsRequestMessageBody {
}

export interface GetAllPermissionsRequestMessage extends Message<GetAllPermissionsRequestMessageBody> {
}

export function createGetAllPermissionsRequestMessage(): GetAllPermissionsRequestMessage {
  const msg: GetAllPermissionsRequestMessage = {
    header: { type: MessageType.getAllPermissionsRequest },
    body: {} as GetAllPermissionsRequestMessageBody,
  };
  return msg;
};
