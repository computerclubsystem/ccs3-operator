import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { FilterServerLogsItem } from '../index-entities';

export interface FilterServerLogsRequestMessageBody {
  filterServerLogsItems: FilterServerLogsItem[];
}

export type FilterServerLogsRequestMessage = Message<FilterServerLogsRequestMessageBody>;

export function createFilterServerLogsRequestMessage(): FilterServerLogsRequestMessage {
  const msg: FilterServerLogsRequestMessage = {
    header: { type: MessageType.filterServerLogsRequest },
    body: {} as FilterServerLogsRequestMessageBody,
  };
  return msg;
}


export type FilterServerLogsReplyMessageBody = object;

export type FilterServerLogsReplyMessage = ReplyMessage<FilterServerLogsReplyMessageBody>;
