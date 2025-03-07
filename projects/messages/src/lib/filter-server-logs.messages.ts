import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';
import { FilterServerLogsItem } from './entities/filter-server-logs-item';

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
