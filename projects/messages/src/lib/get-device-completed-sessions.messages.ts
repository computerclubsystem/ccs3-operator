import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';
import { DeviceSession } from './entities/device-session';
import { TariffUsage } from './entities/tariff-usage';
import { DeviceUsage } from './entities/device-usage';

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
