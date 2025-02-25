import { NotificationMessage } from '@ccs3-operator/messages';

export interface SignInInformationNotificationMessageBody {
  lastShiftCompletedAt?: string | null;
}

export type SignInInformationNotificationMessage = NotificationMessage<SignInInformationNotificationMessageBody>;
