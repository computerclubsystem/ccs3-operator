import { Role } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetAllRolesRequestMessageBody = object;

export type GetAllRolesRequestMessage = Message<GetAllRolesRequestMessageBody>;

export function createGetAllRolesRequestMessage(): GetAllRolesRequestMessage {
  const msg: GetAllRolesRequestMessage = {
    header: { type: MessageType.getAllRolesRequest },
    body: {} as GetAllRolesRequestMessageBody,
  };
  return msg;
}

export interface GetAllRolesReplyMessageBody {
  roles: Role[];
}

export type GetAllRolesReplyMessage = ReplyMessage<GetAllRolesReplyMessageBody>;

