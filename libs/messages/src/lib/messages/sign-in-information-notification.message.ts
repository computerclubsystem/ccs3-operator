import { NotificationMessage } from '../index-declarations';

export interface SignInInformationNotificationMessageBody {
  lastShiftCompletedAt?: string | null;
  lastShiftCompletedByUsername?: string | null;
}

export type SignInInformationNotificationMessage = NotificationMessage<SignInInformationNotificationMessageBody>;
