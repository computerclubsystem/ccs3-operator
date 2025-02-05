import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetAllRolesRequestMessageBody = object;

export type GetAllRolesRequestMessage = Message<GetAllRolesRequestMessageBody>;

export function createGetAllRolesRequestMessage(): GetAllRolesRequestMessage {
  const msg: GetAllRolesRequestMessage = {
    header: { type: MessageType.getAllRolesRequest },
    body: {} as GetAllRolesRequestMessageBody,
  };
  return msg;
};
