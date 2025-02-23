import { User } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export type GetAllUsersRequestMessageBody = object;

export type GetAllUsersRequestMessage = Message<GetAllUsersRequestMessageBody>;

export function createGetAllUsersRequestMessage(): GetAllUsersRequestMessage {
  const msg: GetAllUsersRequestMessage = {
    header: { type: MessageType.getAllUsersRequest },
    body: {} as GetAllUsersRequestMessageBody,
  };
  return msg;
}

export interface GetAllUsersReplyMessageBody {
  users: User[];
}

export type GetAllUsersReplyMessage = ReplyMessage<GetAllUsersReplyMessageBody>;
