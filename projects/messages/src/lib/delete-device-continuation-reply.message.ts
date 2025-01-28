import { ReplyMessage } from './declarations/message';

export interface DeleteDeviceContinuationReplyMessageBody {
  // TODO: In the future the server will return DeviceStatus so the interface can be immediatelly updated
}

export interface DeleteDeviceContinuationReplyMessage extends ReplyMessage<DeleteDeviceContinuationReplyMessageBody> {
}
