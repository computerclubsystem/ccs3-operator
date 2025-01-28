import { Message } from './declarations/message';
import { MessageType } from './declarations/message-type';

export interface RechargeTariffDurationRequestMessageBody {
  tariffId: number;
}

export interface RechargeTariffDurationRequestMessage extends Message<RechargeTariffDurationRequestMessageBody> {
}

export function createRechargeTariffDurationRequestMessage(): RechargeTariffDurationRequestMessage {
  const msg: RechargeTariffDurationRequestMessage = {
    header: { type: MessageType.rechargeTariffDurationRequest },
    body: {} as RechargeTariffDurationRequestMessageBody,
  };
  return msg;
};
