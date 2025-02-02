import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface GetSignedInUsersRequestMessageBody {
}

export interface GetSignedInUsersRequestMessage extends Message<GetSignedInUsersRequestMessageBody> {
}

export function createGetSignedInUsersRequestMessage(): GetSignedInUsersRequestMessage {
  const msg: GetSignedInUsersRequestMessage = {
    header: { type: MessageType.getSignedInUsersRequest },
    body: {} as GetSignedInUsersRequestMessageBody,
  };
  return msg;
};
