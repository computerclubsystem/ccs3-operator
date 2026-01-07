import { inject, Injectable } from '@angular/core';
import { translate } from '@jsverse/transloco';

import { NotificationsService } from '@ccs3-operator/notifications';
import { IconName, MessageTimedOutErrorData } from '@ccs3-operator/shared/types';
import { NotAuthenticatedMessage, SignOutReplyMessage } from '@ccs3-operator/messages';
import { OnCloseEventArgs, OnErrorEventArgs } from '@ccs3-operator/connector';
import { NotificationType } from '@ccs3-operator/shared';

@Injectable({ providedIn: 'root' })
export class NotificationsHelperService {
  private readonly ntfSvc = inject(NotificationsService);

  showSignedOutByNotificationMessage(): void {
    this.ntfSvc.show(NotificationType.warn, translate('You have been signed out by administrator'), null, IconName.priority_high, null);
  }

  showSignedOut(signOutReplyMsg: SignOutReplyMessage): void {
    this.ntfSvc.show(NotificationType.info, translate('Signed out successfully'), null, IconName.check, signOutReplyMsg);
  }

  showSendMessageError(err: unknown): void {
    this.ntfSvc.show(NotificationType.warn, translate('Send message error'), translate('Error occured when sending message to the server'), IconName.priority_high, err);
  }

  showConnectionError(args: OnErrorEventArgs): void {
    this.ntfSvc.show(NotificationType.warn, translate('Connection error'), `State ${args.readyState}`, IconName.priority_high, args);
  }

  showDisconnected(args: OnCloseEventArgs): void {
    this.ntfSvc.show(NotificationType.warn, translate('Disconnected'), `Code ${args.code}`, IconName.wifi_off, args);
  }

  showConnected(): void {
    this.ntfSvc.show(NotificationType.info, translate('Connected'), null, IconName.wifi);
  }

  showSignedIn(): void {
    this.ntfSvc.show(NotificationType.success, translate('Signed in'), null, IconName.check);
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
      translate(`Message was sent to the server but did not receive reply. Message type (messageType)`, { messageType: messageTimedOutErrorData.message.header.type }),
      IconName.priority_high,
      messageTimedOutErrorData
    );
  }
}
