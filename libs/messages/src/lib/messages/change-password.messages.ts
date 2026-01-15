import { Message, ReplyMessage, MessageType } from '../index-declarations';

export interface ChangePasswordRequestMessageBody {
  currentPasswordHash: string;
  newPasswordHash: string;
}

export type ChangePasswordRequestMessage = Message<ChangePasswordRequestMessageBody>;

export function createChangePasswordRequestMessage(): ChangePasswordRequestMessage {
  const msg: ChangePasswordRequestMessage = {
    header: { type: MessageType.changePasswordRequest },
    body: {} as ChangePasswordRequestMessageBody,
  };
  return msg;
}


export type ChangePasswordReplyMessageBody = object;

export type ChangePasswordReplyMessage = ReplyMessage<ChangePasswordReplyMessageBody>;
