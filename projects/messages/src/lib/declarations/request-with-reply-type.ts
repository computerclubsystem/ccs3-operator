import { MessageType } from './message-type';

export interface RequestWithReplyType {
  requestType: MessageType;
  replyType: MessageType;
}
