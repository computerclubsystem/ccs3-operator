import { Message } from './declarations/message';

export interface ConfigurationMessageBody {
  pingInterval: number;
}

export type ConfigurationMessage = Message<ConfigurationMessageBody>;
