import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetAllUsersRequestMessageBody = object;

export type GetAllUsersRequestMessage = Message<GetAllUsersRequestMessageBody>;

export function createGetAllUsersRequestMessage(): GetAllUsersRequestMessage {
  const msg: GetAllUsersRequestMessage = {
    header: { type: MessageType.getAllUsersRequest },
    body: {} as GetAllUsersRequestMessageBody,
  };
  return msg;
};
