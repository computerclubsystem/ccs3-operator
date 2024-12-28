import { Message } from './declarations/message';

export interface ConfigurationMessageBody {
  pingInterval: number;
}

export interface ConfigurationMessage extends Message<ConfigurationMessageBody> {
}
