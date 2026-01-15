import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { UserProfileSettingWithValue } from '../index-entities';

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
