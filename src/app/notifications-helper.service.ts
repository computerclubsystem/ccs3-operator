import { inject, Injectable } from '@angular/core';
import { translate } from '@jsverse/transloco';

import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';
import { IconName, MessageTimedOutErrorData } from '@ccs3-operator/shared/types';
import { NotAuthenticatedMessage, SignOutReplyMessage } from '@ccs3-operator/messages';

@Injectable({ providedIn: 'root' })
export class NotificationsHelperService {
  private readonly ntfSvc = inject(NotificationsService);

  showSignedOut(signOutReplyMsg: SignOutReplyMessage): void {
    this.ntfSvc.show(NotificationType.info, translate('Signed out successfully'), null, IconName.check, signOutReplyMsg);
  }

  showSendMessageError(err: any): void {
    this.ntfSvc.show(NotificationType.warn, translate('Send message error'), translate('Error occured when sending message to the server'), IconName.priority_high, err);
  }

  showConnectionError(): void {
    this.ntfSvc.show(NotificationType.warn, translate('Connection error'));
  }

  showDisconnected(): void {
    this.ntfSvc.show(NotificationType.warn, translate('Disconnected'), null, IconName.wifi_off);
  }

  showConnected(): void {
    this.ntfSvc.show(NotificationType.info, translate('Connected'), null, IconName.wifi);
  }

  showSignedIn(): void {
    this.ntfSvc.show(NotificationType.success, translate('Signed in'), null, IconName.check)
  }

  showAuthenticationErrorCantRefreshTheToken(): void {
    this.ntfSvc.show(NotificationType.warn, translate('Authentication error'), translate(`Can't refresh the token. Sign in again.`), IconName.priority_high);
  }

  showNotAuthenticated(message: NotAuthenticatedMessage): void {
    this.ntfSvc.show(NotificationType.warn, translate('Not authenticated'), translate('Sign in to authenticate'), IconName.priority_high, message);
  }

  showMessageTimedOut(messageTimedOutErrorData: MessageTimedOutErrorData): void {
    this.ntfSvc.show(
      NotificationType.warn,
      translate('Message timed out'),
      translate(`Message was sent to the server but did not receive reply. Message type ${messageTimedOutErrorData.message.header.type} / ${messageTimedOutErrorData.expectedReplyType}`),
      IconName.priority_high,
      messageTimedOutErrorData
    );
  }
}
