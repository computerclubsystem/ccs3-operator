import { User } from '@ccs3-operator/messages';
import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

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
};
