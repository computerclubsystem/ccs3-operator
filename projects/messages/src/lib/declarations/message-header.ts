import { MessageType } from './message-type';
import { RoundTripData } from './round-trip-data';

export interface MessageHeader {
    type: MessageType;
    correlationId?: string;
    token?: string;
    // source?: string;
    // target?: string;
    roundTripData?: RoundTripData;
}
