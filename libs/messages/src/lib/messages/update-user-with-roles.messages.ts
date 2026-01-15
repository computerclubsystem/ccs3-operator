import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { User } from '../index-entities';

export interface UpdateUserWithRolesRequestMessageBody {
  user: User;
  passwordHash?: string;
  roleIds: number[];
}

export type UpdateUserWithRolesRequestMessage = Message<UpdateUserWithRolesRequestMessageBody>;

export function createUpdateUserWithRolesRequestMessage(): UpdateUserWithRolesRequestMessage {
  const msg: UpdateUserWithRolesRequestMessage = {
    header: { type: MessageType.updateUserWithRolesRequest },
    body: {} as UpdateUserWithRolesRequestMessageBody,
  };
  return msg;
}

export interface UpdateUserWithRolesReplyMessageBody {
  user?: User;
  roleIds?: number[];
}

export type UpdateUserWithRolesReplyMessage = ReplyMessage<UpdateUserWithRolesReplyMessageBody>;
