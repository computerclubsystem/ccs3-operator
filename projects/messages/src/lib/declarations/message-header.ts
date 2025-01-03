import { MessageError } from './message-error';
import { MessageType, NotificationMessageType } from './message-type';
import { RoundTripData } from './round-trip-data';

export interface MessageHeader {
  type: MessageType;
  correlationId?: string;
  token?: string;
  // source?: string;
  // target?: string;
  roundTripData?: RoundTripData;
}

export interface ReplyMessageHeader {
  type: MessageType;
  correlationId?: string;
  roundTripData?: RoundTripData;
  failure?: boolean;
  errors?: MessageError[];
}

export interface NotificationMessageHeader {
  type: NotificationMessageType;
  failure?: boolean;
  errors?: MessageError[];
}
