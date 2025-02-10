import { Message, MessageType } from '@ccs3-operator/messages';

export type GetAllSystemSettingsRequestMessageBody = object;

export type GetAllSystemSettingsRequestMessage = Message<GetAllSystemSettingsRequestMessageBody>;

export function createGetAllSystemSettingsRequestMessage(): GetAllSystemSettingsRequestMessage {
  const msg: GetAllSystemSettingsRequestMessage = {
    header: { type: MessageType.getAllSystemSettingsRequest },
    body: {},
  };
  return msg;
}
