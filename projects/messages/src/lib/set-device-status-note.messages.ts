import { Message, MessageType, ReplyMessage } from '@ccs3-operator/messages';

export interface SetDeviceStatusNoteRequestMessageBody {
  deviceIds: number[];
  note: string | null;
}

export type SetDeviceStatusNoteRequestMessage = Message<SetDeviceStatusNoteRequestMessageBody>;

export function createSetDeviceStatusNoteRequestMessage(): SetDeviceStatusNoteRequestMessage {
  const msg: SetDeviceStatusNoteRequestMessage = {
    header: { type: MessageType.setDeviceStatusNoteRequest },
    body: {} as SetDeviceStatusNoteRequestMessageBody,
  };
  return msg;
}

export type SetDeviceStatusNoteReplyMessageBody = object;

export type SetDeviceStatusNoteReplyMessage = ReplyMessage<SetDeviceStatusNoteReplyMessageBody>;
