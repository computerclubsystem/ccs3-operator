import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { SystemSettingNameWithValue } from '../index-entities';

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
