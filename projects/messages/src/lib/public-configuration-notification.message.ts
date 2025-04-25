import { NotificationMessage } from '@ccs3-operator/messages';

export interface PublicConfigurationNotificationFeatureFlags {
  codeSignIn: boolean;
}

export interface PublicConfigurationNotificationMessageBody {
  featureFlags: PublicConfigurationNotificationFeatureFlags;
  authenticationTimeoutSeconds: number;
}

export type PublicConfigurationNotificationMessage = NotificationMessage<PublicConfigurationNotificationMessageBody>;
