import { Message, MessageType } from '@ccs3-operator/messages';

export type GetProfileSettingsRequestMessageBody = object;

export type GetProfileSettingsRequestMessage = Message<GetProfileSettingsRequestMessageBody>;

export function createGetProfileSettingsRequestMessage(): GetProfileSettingsRequestMessage {
  const msg: GetProfileSettingsRequestMessage = {
    header: { type: MessageType.getProfileSettingsRequest },
    body: {},
  };
  return msg;
}
