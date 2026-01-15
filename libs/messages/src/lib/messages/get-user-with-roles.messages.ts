import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { User } from '../index-entities';

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
}

export interface GetUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type GetUserWithRolesReplyMessage = ReplyMessage<GetUserWithRolesReplyMessageBody>;
