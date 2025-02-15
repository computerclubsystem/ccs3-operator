import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetUserWithRolesRequestMessageBody {
  userId: number;
}

export type GetUserWithRolesRequestMessage = Message<GetUserWithRolesRequestMessageBody>;

export function createGetUserWithRolesRequestMessage(): GetUserWithRolesRequestMessage {
  const msg: GetUserWithRolesRequestMessage = {
    header: { type: MessageType.getUserWithRolesRequest },
    body: {} as GetUserWithRolesRequestMessageBody,
  };
  return msg;
};
