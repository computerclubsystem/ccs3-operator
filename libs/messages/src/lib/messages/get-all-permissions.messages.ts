import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Permission } from '../index-entities';

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

