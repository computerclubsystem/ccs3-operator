import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Params, Router, RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { translate, TranslocoService } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { ConnectorService, ConnectorSettings, OnCloseEventArgs, OnErrorEventArgs } from '@ccs3-operator/connector';
import {
  Message, MessageType, AuthReplyMessage, ConfigurationMessage,
  createPingRequestMessage, createAuthRequestMessage, createRefreshTokenRequestMessage,
  RefreshTokenReplyMessage, NotAuthenticatedMessage, AuthRequestMessage,
  SignOutReplyMessage, createSignOutRequestMessage, ReplyMessage, NotificationMessageType,
  NotificationMessage, createGetProfileSettingsRequestMessage, GetProfileSettingsReplyMessage,
  UserProfileSettingName,
} from '@ccs3-operator/messages';
import {
  CustomStylesService, MessageSubjectsService, NotificationType, PermissionName, PermissionsService,
  RouteNavigationService
} from '@ccs3-operator/shared';
import {
  AccountMenuItem, AccountMenuItemId, IconName, MainMenuItem, MainMenuItemId, MessageTimedOutErrorData
} from '@ccs3-operator/shared/types';
import { ToolbarComponent } from '@ccs3-operator/toolbar';
import { MessageTransportService } from '@ccs3-operator/shared';
import { NotificationsService } from '@ccs3-operator/notifications';
import { InternalSubjectsService } from '@ccs3-operator/shared';
import { AppComponentState, StorageKey } from './declarations';
import { QueryParamName, RouteName } from './app.routes';
import { NotificationsHelperService } from './notifications-helper.service';

@Component({
  selector: 'ccs3-op-app-root',
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: 'app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  readonly connectorSvc = inject(ConnectorService);
  readonly messageSubjectsSvc = inject(MessageSubjectsService);
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly messageTransportSvc = inject(MessageTransportService);
  readonly routeNavigationSvc = inject(RouteNavigationService);
  readonly notificationsSvc = inject(NotificationsService);
  readonly permissionsSvc = inject(PermissionsService);
  readonly notificationsHelperSvc = inject(NotificationsHelperService);
  readonly stylesSvc = inject(CustomStylesService);
  readonly matIconRegistry = inject(MatIconRegistry);
  readonly translocoService = inject(TranslocoService);
  readonly document = inject(DOCUMENT);
  readonly router = inject(Router);
  readonly state = this.createState();

  ngOnInit(): void {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    this.subscribeToMessageTransportService();
    this.subscribeToConnectorService();
    this.subscribeToInternalSubjects();
    this.subscribeToRouteNavigationSubjects()
    this.setNotSignedInMainMenuItems();
    this.setNotSignedInAccountMenuItems();
    this.startConnectorService();
    // Check if we have token and authenticate with it
    this.processStoredTokenData();
  }

  subscribeToMessageTransportService(): void {
    this.messageTransportSvc.getSendMessageObservable().subscribe(msg => this.processSendAppMessage(msg));
    this.messageTransportSvc.getMessageReceivedObservable().subscribe(msg => this.processAppMessageReceived(msg));
  }

  subscribeToConnectorService(): void {
    this.connectorSvc.getMessageObservable().subscribe(data => this.processConnectorMessage(data));
    this.connectorSvc.getConnectedObservable().subscribe(() => this.processConnectorConnected());
    this.connectorSvc.getClosedObservable().subscribe(ev => this.processConnectorConnectionClosed(ev));
    this.connectorSvc.getErrorObservable().subscribe(ev => this.processConnectorError(ev));
    this.connectorSvc.getSendMessageErrorObservable().subscribe(ev => this.processConnectorSendMessageError(ev));
  }

  subscribeToInternalSubjects(): void {
    this.internalSubjectsSvc.getSignInRequested().subscribe(authRequestMsg => this.processSignInRequested(authRequestMsg));
    this.internalSubjectsSvc.getMainMenuSelected().subscribe(mainMenu => this.processMainMenuSelected(mainMenu));
    this.internalSubjectsSvc.getAccountMenuSelected().subscribe(accountMenu => this.processAccountMenuSelected(accountMenu));
    this.internalSubjectsSvc.getLanguageSelected().subscribe(language => this.processLanguageSelected(language));
    this.internalSubjectsSvc.getManualAuthSucceeded().subscribe(() => this.processManualAuthSucceeded());
    this.internalSubjectsSvc.getMessageTimedOut().subscribe(messageTimedOutErrorData => this.processMessageTimedOutErrorData(messageTimedOutErrorData));
    this.internalSubjectsSvc.getFailureReplyMessageReceived().subscribe(failureReplyMsg => this.processFailureReplyMessageReceived(failureReplyMsg));
  }

  subscribeToRouteNavigationSubjects(): void {
    this.routeNavigationSvc.getNavigateToSignInRequested().subscribe(() => this.processNavigateToSignInRequested());
    this.routeNavigationSvc.getNavigateToCreateNewTariffRequested().subscribe(() => this.processNavigateToCreateNewTariffRequested());
    this.routeNavigationSvc.getNavigateToEditTariffRequested().subscribe(tariffId => this.processNavigateToEditTariffRequested(tariffId));
    this.routeNavigationSvc.getNavigateToCreateNewPrepaidTariffRequested().subscribe(() => this.processNavigateToCreateNewPrepaidTariffRequested());
    this.routeNavigationSvc.getNavigateToEditPrepaidTariffRequested().subscribe(tariffId => this.processNavigateToEditPrepaidTariffRequested(tariffId));
    this.routeNavigationSvc.getNavigateToCreateNewRoleRequested().subscribe(() => this.processNavigateToCreateNewRoleRequested());
    this.routeNavigationSvc.getNavigateToEditRoleRequested().subscribe(roleId => this.processNavigateToEditRoleRequested(roleId));
    this.routeNavigationSvc.getNavigateToEditDeviceRequested().subscribe(deviceId => this.processNavigateToEditDeviceRequested(deviceId));
    this.routeNavigationSvc.getNavigateToCreateDeviceRequested().subscribe(() => this.processNavigateToCreateDeviceRequested());
  }

  processNavigateToSignInRequested(): void {
    this.router.navigate([RouteName.signIn]);
  }

  processFailureReplyMessageReceived(msg: ReplyMessage<unknown>): void {
    const errors = msg.header.errors;
    const type = msg.header.type;
    const errorItems = errors?.map(x => translate('Error code') + ` '${x.code || ""}'` + (x.description ? `: ${x.description}` : ''));
    const requestType = msg.header.requestType ? translate(`Request message type '{{requestMessageType}}'`, { requestMessageType: msg.header.requestType }) + '.' : '';
    const errorsText = errorItems?.join(' ; ') + (requestType ? '. ' + requestType : '');
    this.notificationsSvc.show(NotificationType.error, translate(`Reply message '{{messageType}}' indicates failure`, { messageType: type }), errorsText, IconName.error, msg);
  }

  processNavigateToEditRoleRequested(roleId: number): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsRoles, roleId, RouteName.sharedRouteEdit]);
  }

  processNavigateToCreateNewRoleRequested(): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsRoles, RouteName.sharedRouteCreate]);
  }

  processNavigateToEditPrepaidTariffRequested(tariffId: number): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsPrepaidTariffs, tariffId, RouteName.sharedRouteEdit]);
  }

  processNavigateToCreateNewPrepaidTariffRequested(): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsPrepaidTariffs, RouteName.sharedRouteCreate]);
  }

  processNavigateToEditTariffRequested(tariffId: number): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsTariffs, tariffId, RouteName.sharedRouteEdit]);
  }

  processNavigateToCreateNewTariffRequested(): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsTariffs, RouteName.sharedRouteCreate]);
  }

  processNavigateToEditDeviceRequested(deviceId: number): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsDevices, deviceId, RouteName.sharedRouteEdit]);
  }

  processNavigateToCreateDeviceRequested(): void {
    this.router.navigate([RouteName.systemSettings, RouteName.systemSettingsDevices, RouteName.sharedRouteCreate]);
  }

  processMessageTimedOutErrorData(messageTimedOutErrorData: MessageTimedOutErrorData): void {
    this.notificationsHelperSvc.showMessageTimedOut(messageTimedOutErrorData);
  }

  processManualAuthSucceeded(): void {
    this.redirectToDesiredUrl();
  }

  processSignInRequested(authRequestMsg: AuthRequestMessage): void {
    this.messageTransportSvc.sendAndAwaitForReply(authRequestMsg)
      .subscribe(authReplyMsg => this.processAuthReplyMessage(authReplyMsg as AuthReplyMessage));
  }

  processLanguageSelected(language: string): void {
    this.translocoService.setActiveLang(language);
  }

  processMainMenuSelected(mainMenuItem: MainMenuItem): void {
    switch (mainMenuItem.id) {
      case MainMenuItemId.computerStatuses:
        this.router.navigate([RouteName.computerStatuses]);
        break;
      case MainMenuItemId.notifications:
        this.router.navigate([RouteName.notifications]);
        break;
      case MainMenuItemId.systemSettings:
        this.router.navigate([RouteName.systemSettings]);
        break;
      case MainMenuItemId.reports:
        this.router.navigate([RouteName.reports]);
        break;
    }
  }

  processAccountMenuSelected(accountMenuItem: AccountMenuItem): void {
    switch (accountMenuItem.id) {
      case AccountMenuItemId.signIn:
        this.navigateToSignIn();
        break;
      case AccountMenuItemId.signOut:
        this.processSignOutAccountMenuSelected();
        break;
      case AccountMenuItemId.profileSettings:
        this.processProfileSettingsAccountMenuSelected();
        break;
    }
  }

  processProfileSettingsAccountMenuSelected(): void {
    this.router.navigate([RouteName.profileSettings]);
  }

  processSignOutAccountMenuSelected(): void {
    // TODO: This message potentially can come from the server without requested so we could listen for it in the global message listener function
    //       For example because of a feature that allows administrators to sign-out other users
    const signOutRequestMsg = createSignOutRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(signOutRequestMsg).subscribe({
      next: signOutReplyMsg => {
        // Receiving sign out reply message means it suceeded
        this.performSignOut(signOutReplyMsg as SignOutReplyMessage | null);
      },
      error: () => {
        // On error also sign out
        const signOutReplyMsg: SignOutReplyMessage = {
          body: {
            receivedMessagesCount: 0,
            sentPingMessagesCount: 0,
            sentMessagesCount: 0,
            sessionEnd: 0,
            sessionStart: 0,
          },
          header: {
            type: MessageType.signOutReply,
          }
        };
        this.performSignOut(signOutReplyMsg);
      }
    });
  }

  async processSignedOutNotificationMessage(): Promise<void> {
    this.performSignOut(null);
    this.notificationsHelperSvc.showSignedOutByNotificationMessage();
    this.router.navigate([RouteName.signedOutByAdministrator]);
  }

  performSignOut(signOutReplyMessage: SignOutReplyMessage | null): void {
    this.applyCustomCss('');
    this.stopPing();
    this.stopRefreshTokenTimer();
    this.removeStoredTokenData();
    this.setNotSignedInAccountMenuItems();
    this.setNotSignedInMainMenuItems();
    this.internalSubjectsSvc.setSignedIn(false);
    if (signOutReplyMessage) {
      this.internalSubjectsSvc.setSignOutReplyMessage(signOutReplyMessage);
      this.notificationsHelperSvc.showSignedOut(signOutReplyMessage);
      this.router.navigate([RouteName.signedOutSessionStats]);
    }
  }

  startConnectorService(): void {
    const connectorSettings: ConnectorSettings = {
      url: `wss://${this.document.defaultView?.location.host}`,
      reconnectDelay: 3000,
    };
    this.connectorSvc.start(connectorSettings);
  }

  private processStoredTokenData(): void {
    // When connected and if there is a token in the storage,
    // use it to authenticate
    this.internalSubjectsSvc.getConnected().pipe(
      filter(isConnected => isConnected),
    ).subscribe(() => {
      const tokenData = this.getStoredTokenData();
      if (tokenData?.token) {
        const authRequestMsg = createAuthRequestMessage();
        authRequestMsg.body.token = tokenData.token;
        this.messageTransportSvc.sendAndAwaitForReply(authRequestMsg)
          .subscribe(authReplyMsg => this.processAuthReplyMessage(authReplyMsg as AuthReplyMessage));
      } else {
        this.internalSubjectsSvc.setSignedIn(false);
        // TODO: Find routes that should not be redirected like "You have been signed out by administrator" route
        //       should not navigate to sign-in url because the user needs to see the information.
        //       Same for "Signed out session stats"
        // this.navigateToSignInWithReturnUrl();
      }
    });
  }

  private async processConnectorMessage(data: unknown): Promise<void> {
    const message = await this.parseMessage(data);
    if (!message?.header?.type) {
      return;
    }
    this.messageSubjectsSvc.getAppMessageReceivedSubject().next(message);
  }

  private processSendAppMessage<TBody>(message: Message<TBody>): void {
    // Some component wants to send message (MessageSenderService.sendMessage was called)
    // Redirect the message to the connector service
    this.connectorSvc.sendMessage(message);
  }

  /**
   * This function will usually process only messages that are not awaited
   * All messages that have responses are normally handled by the sender
   * @param message
   */
  private processAppMessageReceived<TBody>(message: Message<TBody> | NotificationMessage<TBody> | ReplyMessage<TBody>): void {
    const type = message.header.type;
    switch (type) {
      case NotificationMessageType.signedOutNotification:
        this.processSignedOutNotificationMessage();
        break;
      case MessageType.configuration:
        this.processConfigurationMessage(message as ConfigurationMessage);
        break;
      case MessageType.notAuthenticated:
        this.processNotAuthenticatedMessage(message as NotAuthenticatedMessage);
        break;
    }
  }

  private processNotAuthenticatedMessage(message: NotAuthenticatedMessage): void {
    this.notificationsHelperSvc.showNotAuthenticated(message);
  }

  private processRefreshTokenReplyMessage(message: RefreshTokenReplyMessage): void {
    this.messageTransportSvc.setToken(message.body.token);
    if (message.body.success) {
      const existingTokenData = this.getStoredTokenData();
      const newTokenData: TokenData = {
        token: message.body.token!,
        tokenExpiresAt: message.body.tokenExpiresAt!,
        permissions: existingTokenData?.permissions || [],
      };
      this.storeTokenData(newTokenData);
      this.setUpRefreshTokenTimer(message.body.tokenExpiresAt!);
    } else {
      this.removeStoredTokenData();
      this.notificationsHelperSvc.showAuthenticationErrorCantRefreshTheToken();
    }
  }

  private processConfigurationMessage(message: ConfigurationMessage): void {
    this.internalSubjectsSvc.setConfigurationMessage(message);
    this.startPing(message.body.pingInterval);
  }

  private processAuthReplyMessage(message: AuthReplyMessage): void {
    // This can be token refresh reply (if the request contains only token)
    // If permissions are ampy get these from the session storage
    let permissions = message?.body?.permissions as PermissionName[];
    if (!permissions) {
      const tokenData = this.getStoredTokenData();
      permissions = (tokenData?.permissions || []) as PermissionName[];
    }
    this.permissionsSvc.setPermissions(permissions);
    this.messageTransportSvc.setToken(message.body.token);
    if (message.body.success) {
      const tokenData: TokenData = {
        token: message.body.token!,
        tokenExpiresAt: message.body.tokenExpiresAt!,
        permissions: permissions
      };
      this.storeTokenData(tokenData);
      this.notificationsHelperSvc.showSignedIn();
      this.internalSubjectsSvc.setSignedIn(true);
      this.setSignedInMainMenuItems();
      this.setSignedInAccountMenuItems();
      this.setUpRefreshTokenTimer(message.body.tokenExpiresAt!);
      this.redirectToDesiredUrl();
      this.loadAndApplyProfileSettings();
    } else {
      this.removeStoredTokenData();
      this.setNotSignedInMainMenuItems();
      this.setNotSignedInAccountMenuItems();
      this.removeStoredTokenData();
      this.navigateToSignInWithReturnUrl();
    }
  }

  private loadAndApplyProfileSettings(): void {
    const reqMsg = createGetProfileSettingsRequestMessage();
    this.messageTransportSvc.sendAndAwaitForReply(reqMsg)
      .subscribe(replyMsg => this.processGetProfileSettingsReplyMessage(replyMsg as GetProfileSettingsReplyMessage));
  }

  private processGetProfileSettingsReplyMessage(replyMsg: GetProfileSettingsReplyMessage): void {
    if (replyMsg.header.failure) {
      return;
    }
    const customCssSetting = replyMsg.body.settings.find(x => x.name === UserProfileSettingName.customCss);
    this.applyCustomCss(customCssSetting?.value);
  }

  private applyCustomCss(css?: string | null): void {
    this.stylesSvc.applyStyleText(css || '');
  }

  private redirectToDesiredUrl(): void {
    const url = new URL(window.location.href);
    const returnUrl = url.searchParams.get(QueryParamName.returnUrl);
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      // No return URL - if we are at the root - check permissions and navigate to route with least permission (computer statuses)
      if (url.pathname === '/' || url.pathname === `/${RouteName.signIn}`) {
        if (this.permissionsSvc.hasPermission(PermissionName.devicesReadStatus)) {
          this.navigateToComputerStatuses();
        }
      }
    }
  }

  private setSignedInMainMenuItems(): void {
    const signedInMainMenuItems: MainMenuItem[] = [
      { id: MainMenuItemId.computerStatuses, icon: IconName.dvr, translationKey: 'Computers' },
      { id: MainMenuItemId.notifications, icon: IconName.notifications, translationKey: 'Notifications' },
      // TODO: Check for any of the required permission
      { id: MainMenuItemId.systemSettings, icon: IconName.settings, translationKey: 'System settings' },
      // TODO: Check for any of the required permission
      { id: MainMenuItemId.reports, icon: IconName.query_stats, translationKey: 'Reports' },
    ];
    this.internalSubjectsSvc.setMainMenuItems(signedInMainMenuItems);
  }

  private setNotSignedInMainMenuItems(): void {
    const notSignedInMainMenuItems: MainMenuItem[] = [
      { id: MainMenuItemId.notifications, icon: IconName.notifications, translationKey: 'Notifications' },
    ];
    this.internalSubjectsSvc.setMainMenuItems(notSignedInMainMenuItems);
  }

  private setSignedInAccountMenuItems(): void {
    const signedInAccountMenuItems: AccountMenuItem[] = [
      { id: AccountMenuItemId.profileSettings, icon: IconName.user_attributes, translationKey: 'Profile settings' },
      { id: AccountMenuItemId.signOut, icon: IconName.logout, translationKey: 'Sign out' },
    ];
    this.internalSubjectsSvc.setAccountMenuItems(signedInAccountMenuItems);
  }

  private setNotSignedInAccountMenuItems(): void {
    const notSignedInAccountMenuItems: AccountMenuItem[] = [
      { id: AccountMenuItemId.signIn, icon: IconName.login, translationKey: 'Sign in' },
    ];
    this.internalSubjectsSvc.setAccountMenuItems(notSignedInAccountMenuItems);
  }

  private navigateToSignInWithReturnUrl(): void {
    const url = new URL(window.location.href);
    const returnUrl = url.searchParams.get(QueryParamName.returnUrl);
    if (returnUrl) {
      // Already have returnUrl
      // This can happen if the user is currently on log-in screen with returnUrl parameter
      // and connection is disconnected and connected again
      // This causes processStoredAuthReplyMessage getConnected observable callback to be called
      // which ends up here
      // We will just reuse the returnUrl
      const queryParams = { [QueryParamName.returnUrl]: returnUrl };
      this.router.navigate([RouteName.signIn], { queryParams: queryParams });
      return;
    }
    // No returnUrl in the location - add it
    const currentLocationPathname = window.location.pathname;
    let queryParams: Params = {};
    if (currentLocationPathname !== `/${RouteName.signIn}`) {
      queryParams = { [QueryParamName.returnUrl]: window.location.href };
    }
    this.router.navigate([RouteName.signIn], { queryParams: queryParams });
  }

  private navigateToComputerStatuses(): void {
    this.router.navigate([RouteName.computerStatuses]);
  }

  private navigateToSignIn(): void {
    this.router.navigate([RouteName.signIn]);
  }

  private stopRefreshTokenTimer(): void {
    window.clearTimeout(this.state.refreshTokenTimeHandle);
  }

  private setUpRefreshTokenTimer(tokenExpiresAt: number): void {
    if (!tokenExpiresAt) {
      return;
    }
    this.stopRefreshTokenTimer();
    const now = Date.now();
    const diff = tokenExpiresAt - now;
    // When 90% of the remaining time elapses, refresh the token
    const interval = (90 * diff) / 100;
    this.state.refreshTokenTimeHandle = window.setTimeout(() => {
      const token = this.messageTransportSvc.getToken();
      if (token) {
        const refreshTokenMsg = createRefreshTokenRequestMessage();
        refreshTokenMsg.body.currentToken = token;
        // this.messageTransportSvc.sendMessage(refreshTokenMsg);
        this.messageTransportSvc.sendAndAwaitForReply(refreshTokenMsg)
          .subscribe(replyMsg => this.processRefreshTokenReplyMessage(replyMsg as RefreshTokenReplyMessage));
      }
    }, interval);
  }

  private processConnectorConnected(): void {
    // TODO: This can happen faster than the translations file is loaded. If this is the case, warning will be logged in the browser console
    this.notificationsHelperSvc.showConnected();
    this.internalSubjectsSvc.setConnected(true);
  }

  private processConnectorConnectionClosed(args: OnCloseEventArgs): void {
    this.notificationsHelperSvc.showDisconnected(args);
    this.stopPing();
    this.internalSubjectsSvc.setConnected(false);
  }

  private processConnectorError(args: OnErrorEventArgs): void {
    this.notificationsHelperSvc.showConnectionError(args);
  }

  private processConnectorSendMessageError(err: unknown): void {
    this.notificationsHelperSvc.showSendMessageError(err);
  }

  private async parseMessage<TBody>(data: unknown): Promise<Message<TBody> | undefined> {
    let message: Message<TBody>;
    if (typeof data === 'string') {
      message = JSON.parse(data);
    } else {
      // If not string, then it must be binary Blob
      const blob = data as Blob;
      const text = await blob.text();
      message = JSON.parse(text);
    }
    return message;
  }

  private removeStoredTokenData(): void {
    window.sessionStorage.removeItem(StorageKey.tokenData);
  }

  private storeTokenData(tokenData: TokenData): void {
    window.sessionStorage.setItem(StorageKey.tokenData, JSON.stringify(tokenData));
  }

  private getStoredTokenData(): TokenData | null {
    const value = window.sessionStorage.getItem(StorageKey.tokenData);
    if (!value) {
      return null;
    }

    let result: TokenData | null = null;
    try {
      result = JSON.parse(value);
    } catch {
      this.removeStoredTokenData();
    }
    return result;
  }

  private startPing(interval: number): void {
    this.stopPing();
    this.state.pingTimerHandle = window.setInterval(() => {
      const pingMsg = createPingRequestMessage();
      this.messageTransportSvc.sendMessage(pingMsg);
    }, interval);
  }

  private stopPing(): void {
    window.clearInterval(this.state.pingTimerHandle);
  }

  createState(): AppComponentState {
    const state: AppComponentState = {
      pingTimerHandle: 0,
      refreshTokenTimeHandle: 0,
    };
    return state;
  }
}

interface TokenData {
  token: string;
  tokenExpiresAt: number;
  permissions: string[];
}
