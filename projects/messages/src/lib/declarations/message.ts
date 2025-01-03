import { MessageHeader, NotificationMessageHeader, ReplyMessageHeader } from './message-header';

export interface Message<TBody> {
  header: MessageHeader;
  body: TBody;
}

export interface ReplyMessage<TBody> {
  header: ReplyMessageHeader;
  body: TBody;
}

export interface NotificationMessage<TBody> {
  header: NotificationMessageHeader;
  body: TBody;
}
