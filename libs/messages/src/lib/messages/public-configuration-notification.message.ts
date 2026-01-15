import { NotificationMessage } from '../index-declarations';

export interface PublicConfigurationNotificationFeatureFlags {
  codeSignIn: boolean;
}

export interface PublicConfigurationNotificationMessageBody {
  featureFlags: PublicConfigurationNotificationFeatureFlags;
  authenticationTimeoutSeconds: number;
}

export type PublicConfigurationNotificationMessage = NotificationMessage<PublicConfigurationNotificationMessageBody>;
