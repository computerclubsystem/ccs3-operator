import { User } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
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
}

export interface GetUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type GetUserWithRolesReplyMessage = ReplyMessage<GetUserWithRolesReplyMessageBody>;
