import { Message, MessageType, ReplyMessage, UserProfileSettingWithValue } from '@ccs3-operator/messages';

export type GetProfileSettingsRequestMessageBody = object;

export type GetProfileSettingsRequestMessage = Message<GetProfileSettingsRequestMessageBody>;

export function createGetProfileSettingsRequestMessage(): GetProfileSettingsRequestMessage {
  const msg: GetProfileSettingsRequestMessage = {
    header: { type: MessageType.getProfileSettingsRequest },
    body: {},
  };
  return msg;
}

export interface GetProfileSettingsReplyMessageBody {
  username: string;
  settings: UserProfileSettingWithValue[];
}

export type GetProfileSettingsReplyMessage = ReplyMessage<GetProfileSettingsReplyMessageBody>;
