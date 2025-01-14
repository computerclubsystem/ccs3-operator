import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetAllUsersRequestMessageBody {
}

export interface GetAllUsersRequestMessage extends Message<GetAllUsersRequestMessageBody> {
}

export function createGetAllUsersRequestMessage(): GetAllUsersRequestMessage {
  const msg: GetAllUsersRequestMessage = {
    header: { type: MessageType.getAllUsersRequest },
    body: {} as GetAllUsersRequestMessageBody,
  };
  return msg;
};
