import { Message, ReplyMessage, MessageType } from '../index-declarations';
import { SystemSetting } from '../index-entities';

export type GetAllSystemSettingsRequestMessageBody = object;

export type GetAllSystemSettingsRequestMessage = Message<GetAllSystemSettingsRequestMessageBody>;

export function createGetAllSystemSettingsRequestMessage(): GetAllSystemSettingsRequestMessage {
  const msg: GetAllSystemSettingsRequestMessage = {
    header: { type: MessageType.getAllSystemSettingsRequest },
    body: {},
  };
  return msg;
}

export interface GetAllSystemSettingsReplyMessageBody {
  systemSettings: SystemSetting[];
}

export type GetAllSystemSettingsReplyMessage = ReplyMessage<GetAllSystemSettingsReplyMessageBody>;
