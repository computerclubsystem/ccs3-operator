import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { User } from '../index-entities';

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
