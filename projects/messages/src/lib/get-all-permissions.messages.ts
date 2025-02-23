import { Permission } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetAllPermissionsRequestMessageBody = object;

export type GetAllPermissionsRequestMessage = Message<GetAllPermissionsRequestMessageBody>;

export function createGetAllPermissionsRequestMessage(): GetAllPermissionsRequestMessage {
  const msg: GetAllPermissionsRequestMessage = {
    header: { type: MessageType.getAllPermissionsRequest },
    body: {} as GetAllPermissionsRequestMessageBody,
  };
  return msg;
}

export interface GetAllPermissionsReplyMessageBody {
  permissions: Permission[];
}

export type GetAllPermissionsReplyMessage = ReplyMessage<GetAllPermissionsReplyMessageBody>;

