import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';
import { SystemSettingNameWithValue } from './entities/system-setting-name-with-value';

export interface UpdateSystemSettingsValuesRequestMessageBody {
  systemSettingsNameWithValues: SystemSettingNameWithValue[];
}

export type UpdateSystemSettingsValuesRequestMessage = Message<UpdateSystemSettingsValuesRequestMessageBody>;

export function createUpdateSystemSettingsValuesRequestMessage(): UpdateSystemSettingsValuesRequestMessage {
  const msg: UpdateSystemSettingsValuesRequestMessage = {
    header: { type: MessageType.updateSystemSettingsValuesRequest },
    body: {} as UpdateSystemSettingsValuesRequestMessageBody,
  };
  return msg;
}

export type UpdateSystemSettingsValuesReplyMessageBody = object;

export type UpdateSystemSettingsValuesReplyMessage = ReplyMessage<UpdateSystemSettingsValuesReplyMessageBody>;
