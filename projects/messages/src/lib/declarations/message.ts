import { MessageHeader } from './message-header';

export interface Message<TBody> {
    header: MessageHeader;
    body: TBody;
}
