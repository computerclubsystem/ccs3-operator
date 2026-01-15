import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { Role } from '../index-entities';

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

