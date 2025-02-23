import { User } from '@ccs3-operator/messages';
import { Message, ReplyMessage } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface CreateUserWithRolesRequestMessageBody {
  user: User;
  passwordHash: string;
  roleIds: number[];
}

export type CreateUserWithRolesRequestMessage = Message<CreateUserWithRolesRequestMessageBody>;

export function createCreateUserWithRolesRequestMessage(): CreateUserWithRolesRequestMessage {
  const msg: CreateUserWithRolesRequestMessage = {
    header: { type: MessageType.createUserWithRolesRequest },
    body: {} as CreateUserWithRolesRequestMessageBody,
  };
  return msg;
}

export interface CreateUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type CreateUserWithRolesReplyMessage = ReplyMessage<CreateUserWithRolesReplyMessageBody>;

