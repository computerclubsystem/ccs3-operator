import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetAllRolesRequestMessageBody {
}

export interface GetAllRolesRequestMessage extends Message<GetAllRolesRequestMessageBody> {
}

export function createGetAllRolesRequestMessage(): GetAllRolesRequestMessage {
  const msg: GetAllRolesRequestMessage = {
    header: { type: MessageType.getAllRolesRequest },
    body: {} as GetAllRolesRequestMessageBody,
  };
  return msg;
};
