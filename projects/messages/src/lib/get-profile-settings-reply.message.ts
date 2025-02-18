import { ReplyMessage } from '@ccs3-operator/messages';
import { UserProfileSettingWithValue } from './entities/user-profile-setting-with-value';

export interface GetProfileSettingsReplyMessageBody {
  username: string;
  settings: UserProfileSettingWithValue[];
}

export type GetProfileSettingsReplyMessage = ReplyMessage<GetProfileSettingsReplyMessageBody>;
