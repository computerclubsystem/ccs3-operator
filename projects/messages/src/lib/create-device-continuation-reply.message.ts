import { ReplyMessage } from './declarations/message';
import { DeviceContinuation } from './entities/device-continuation';

export interface CreateDeviceContinuationReplyMessageBody {
  deviceContinuation: DeviceContinuation;
}

export type CreateDeviceContinuationReplyMessage = ReplyMessage<CreateDeviceContinuationReplyMessageBody>;
