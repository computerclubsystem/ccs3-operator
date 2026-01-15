import { Message } from '../index-declarations';

export interface ConfigurationMessageBody {
  pingInterval: number;
}

export type ConfigurationMessage = Message<ConfigurationMessageBody>;
