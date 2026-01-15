import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { DeviceSession, TariffUsage, DeviceUsage } from '../index-entities';

export interface GetDeviceCompletedSessionsRequestMessageBody {
  fromDate: string;
  toDate: string;
  deviceId?: number | null;
  userId?: number | null;
  tariffId?: number | null;
}

export type GetDeviceCompletedSessionsRequestMessage = Message<GetDeviceCompletedSessionsRequestMessageBody>;

export function createGetDeviceCompletedSessionsRequestMessage(): GetDeviceCompletedSessionsRequestMessage {
  const msg: GetDeviceCompletedSessionsRequestMessage = {
    header: { type: MessageType.getDeviceCompletedSessionsRequest },
    body: {} as GetDeviceCompletedSessionsRequestMessageBody,
  };
  return msg;
}

export interface GetDeviceCompletedSessionsReplyMessageBody {
  deviceSessions: DeviceSession[];
  totalSum: number;
  tariffUsages: TariffUsage[];
  deviceUsages: DeviceUsage[];
}

export type GetDeviceCompletedSessionsReplyMessage = ReplyMessage<GetDeviceCompletedSessionsReplyMessageBody>;
