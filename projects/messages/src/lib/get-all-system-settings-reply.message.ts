import { ReplyMessage } from '@ccs3-operator/messages';
import { SystemSetting } from './entities/system-setting';

export interface GetAllSystemSettingsReplyMessageBody {
  systemSettings: SystemSetting[];
}

export type GetAllSystemSettingsReplyMessage = ReplyMessage<GetAllSystemSettingsReplyMessageBody>;
