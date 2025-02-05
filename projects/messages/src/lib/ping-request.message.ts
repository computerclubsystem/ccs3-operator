import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface PingRequestMessageBody {
  username?: string;
  passwordHash?: string;
  token?: string;
}

export type PingRequestMessage = Message<PingRequestMessageBody>;

export function createPingRequestMessage(): PingRequestMessage {
  const msg: PingRequestMessage = {
    header: { type: MessageType.pingRequest },
    body: {}
  };
  return msg;
};
