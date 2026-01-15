import { Message, ReplyMessage, MessageType } from '../index-declarations';

export interface RestartDevicesRequestMessageBody {
  deviceIds: number[];
}

export type RestartDevicesRequestMessage = Message<RestartDevicesRequestMessageBody>;

export function createRestartDevicesRequestMessage(): RestartDevicesRequestMessage {
  const msg: RestartDevicesRequestMessage = {
    header: { type: MessageType.restartDevicesRequest },
    body: {} as RestartDevicesRequestMessageBody,
  };
  return msg;
}


export interface RestartDevicesReplyMessageBody {
  targetsCount: number;
};

export type RestartDevicesReplyMessage = ReplyMessage<RestartDevicesReplyMessageBody>;
