import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';
import { UserProfileSettingWithValue } from './entities/user-profile-setting-with-value';

export interface UpdateProfileSettingsRequestMessageBody {
  profileSettings: UserProfileSettingWithValue[];
}

export type UpdateProfileSettingsRequestMessage = Message<UpdateProfileSettingsRequestMessageBody>;

export function createUpdateProfileSettingsRequestMessage(): UpdateProfileSettingsRequestMessage {
  const msg: UpdateProfileSettingsRequestMessage = {
    header: { type: MessageType.updateProfileSettingsRequest },
    body: {} as UpdateProfileSettingsRequestMessageBody,
  };
  return msg;
}

export type UpdateProfileSettingsReplyMessageBody = object;

export type UpdateProfileSettingsReplyMessage = ReplyMessage<UpdateProfileSettingsReplyMessageBody>;
