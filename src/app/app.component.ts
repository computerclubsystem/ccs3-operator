import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { MatIconRegistry } from '@angular/material/icon';
import { filter, take } from 'rxjs';

import { ConnectorService, ConnectorSettings } from '@ccs3-operator/connector';
import {
  Message, MessageType, AuthReplyMessage, AuthReplyMessageBody, ConfigurationMessage,
  createPingRequestMessage, createAuthRequestMessage, createRefreshTokenRequestMessage,
  RefreshTokenReplyMessage, NotAuthenticatedMessage,
} from '@ccs3-operator/messages';
import { IconName, MessageSubjectsService, PermissionsService } from '@ccs3-operator/shared';
import { ToolbarComponent } from '@ccs3-operator/toolbar';
import { MessageTransportService } from '@ccs3-operator/shared';
import { NotificationsService, NotificationType } from '@ccs3-operator/notifications';
import { InternalSubjectsService } from '@ccs3-operator/shared';
import { AppComponentState, RouteName, StorageKey } from './declarations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToolbarComponent],
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit {
  connectorSvc = inject(ConnectorService);
  messageSubjectsSvc = inject(MessageSubjectsService);
  internalSubjectsSvc = inject(InternalSubjectsService);
  messageTransportSvc = inject(MessageTransportService);
  notificationsSvc = inject(NotificationsService);
  permissionsSvc = inject(PermissionsService);
  matIconRegistry = inject(MatIconRegistry);
  document = inject(DOCUMENT);
  router = inject(Router);
  state = this.createState();

  ngOnInit(): void {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
    // this.loadWebAppConfig();
    this.subscribeToMessageTransportService();
    this.subscribeToConnectorService();
    this.subscribeToInternalSubjects();
    this.startConnectorService();

    // Check if we have token and authenticate with it
    this.processStoredAuthReplyMessage();
  }

  subscribeToMessageTransportService(): void {
    this.messageTransportSvc.getSendMessageObservable().subscribe(msg => this.processSendAppMessage(msg));
    this.messageTransportSvc.getMessageReceivedObservable().subscribe(msg => this.processAppMessageReceived(msg));
  }

  subscribeToConnectorService(): void {
    this.connectorSvc.getMessageObservable().subscribe(data => this.processConnectorMessage(data));
    this.connectorSvc.getConnectedObservable().subscribe(ev => this.processConnectorConnected(ev));
    this.connectorSvc.getClosedObservable().subscribe(ev => this.processConnectorConnectionClosed(ev));
    this.connectorSvc.getErrorObservable().subscribe(ev => this.processConnectorError(ev));
    this.connectorSvc.getMessageErrorObservable().subscribe(ev => this.processConnectorMessageError(ev));
  }

  subscribeToInternalSubjects(): void {
    this.internalSubjectsSvc.getSignInRequested().subscribe(() => this.processSignInRequested());
    this.internalSubjectsSvc.getNavigateToNotificationsRequested().subscribe(() => this.processNavigateToNotificationsRequested());
  }

  startConnectorService(): void {
    const connectorSettings: ConnectorSettings = {
      url: `wss://${this.document.defaultView?.location.host}`,
      reconnectDelay: 3000,
    };
    this.connectorSvc.start(connectorSettings);
  }

  private processStoredAuthReplyMessage(): void {
    // When connected and if there is a token in the storage,
    // use it to authenticate
    this.internalSubjectsSvc.getConnected().pipe(
      filter(isConnected => isConnected),
    ).subscribe(() => {
      const storedAuthReplyMessage = this.getStoredAuthReplyMessage();
      if (storedAuthReplyMessage?.body?.success) {
        const msg = createAuthRequestMessage();
        msg.body.token = storedAuthReplyMessage.body.token;
        this.messageTransportSvc.sendMessage(msg);
      }
    });

    const storedAuthReplyMessage = this.getStoredAuthReplyMessage();
    if (!storedAuthReplyMessage?.body?.success) {
      this.internalSubjectsSvc.setLoggedIn(false);
      this.router.navigate([RouteName.signIn]);
    }
  }

  // private async loadWebAppConfig(): Promise<void> {
  //   const res = await fetch('web-app-config.json');
  //   const config = await res.json();
  //   this.subjectsSvc.getWebAppConfigSubject().next(config);
  // }

  private async processConnectorMessage(data: any): Promise<void> {
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

  private processAppMessageReceived<TBody>(message: Message<TBody>): void {
    const type = message.header.type;
    switch (type) {
      case MessageType.authReply:
        this.processAuthReplyMessage(message as AuthReplyMessage);
        break;
      case MessageType.configuration:
        this.processConfigurationMessage(message as ConfigurationMessage);
        break;
      case MessageType.refreshTokenReply:
        this.processRefreshTokenReplyMessage(message as RefreshTokenReplyMessage);
        break;
      case MessageType.notAuthenticated:
        this.processNotAuthenticatedMessage(message as NotAuthenticatedMessage);
        break;
      default:
        this.notificationsSvc.show(NotificationType.warn, 'Unknown message received', type, null, message);
        break;
    }
  }

  private processNotAuthenticatedMessage(message: NotAuthenticatedMessage): void {
    this.notificationsSvc.show(NotificationType.warn, 'Not authenticated', 'Sign in to authenticate', IconName.priority_high, message);
  }

  private processRefreshTokenReplyMessage(message: RefreshTokenReplyMessage): void {
    this.messageTransportSvc.setToken(message.body.token);
    if (!message.body.success) {
      this.notificationsSvc.show(NotificationType.warn, 'Authentication error', `Can't refresh the token. Sign in again.`, IconName.priority_high);
    } else {
      this.setUpRefreshTokenTimer(message.body.tokenExpiresAt!);
    }
  }

  private processConfigurationMessage(message: ConfigurationMessage): void {
    this.internalSubjectsSvc.setConfigurationMessage(message);
    this.startPing(message.body.pingInterval);
  }

  private processAuthReplyMessage(message: AuthReplyMessage): void {
    this.permissionsSvc.setPermissions(message?.body?.permissions || []);
    this.messageTransportSvc.setToken(message.body.token);
    if (message.body.success) {
      this.storeAuthReplyMessage(message);
      this.notificationsSvc.show(NotificationType.success, 'Signed in', null, IconName.check)
      this.internalSubjectsSvc.setLoggedIn(true);
      this.setUpRefreshTokenTimer(message.body.tokenExpiresAt!);
    } else {
      this.removeStoredAuthReplyMessage();
    }
  }

  private processSignInRequested(): void {
    this.router.navigate([RouteName.signIn]);
  }

  private processNavigateToNotificationsRequested(): void {
    this.router.navigate([RouteName.notifications]);
  }

  private setUpRefreshTokenTimer(tokenExpiresAt: number): void {
    if (!tokenExpiresAt) {
      return;
    }
    window.clearTimeout(this.state.refreshTokenTimeHandle);
    const now = Date.now();
    const diff = tokenExpiresAt - now;
    // When 90% of the remaining time elapses, refresh the token
    const interval = (90 * diff) / 100;
    this.state.refreshTokenTimeHandle = window.setTimeout(() => {
      const token = this.messageTransportSvc.getToken();
      if (token) {
        const refreshTokenMsg = createRefreshTokenRequestMessage();
        refreshTokenMsg.body.currentToken = token;
        this.messageTransportSvc.sendMessage(refreshTokenMsg);
      }
    }, interval);
  }

  private processConnectorConnected(ev: any): void {
    this.notificationsSvc.show(NotificationType.info, 'Connected', null, IconName.wifi);
    this.internalSubjectsSvc.setConnected(true);
  }

  private processConnectorConnectionClosed(ev: any): void {
    this.notificationsSvc.show(NotificationType.warn, 'Disconnected', null, IconName.wifi_off);
    this.stopPing();
    this.internalSubjectsSvc.setConnected(false);
  }

  private processConnectorError(ev: any): void {
    this.notificationsSvc.show(NotificationType.warn, 'Connection error');
  }

  private processConnectorMessageError(ev: any): void {
    this.notificationsSvc.show(NotificationType.warn, 'Message error');
  }

  private async parseMessage<TBody>(data: any): Promise<Message<TBody> | undefined> {
    let message: Message<any>;
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

  private removeStoredAuthReplyMessage(): void {
    window.sessionStorage.removeItem(StorageKey.authReplyMessage);
  }

  private storeAuthReplyMessage(message: Message<AuthReplyMessageBody>): void {
    window.sessionStorage.setItem(StorageKey.authReplyMessage, JSON.stringify(message));
  }

  private getStoredAuthReplyMessage(): Message<AuthReplyMessageBody> | null {
    const value = window.sessionStorage.getItem(StorageKey.authReplyMessage);
    if (!value) {
      return null;
    }

    let result: Message<AuthReplyMessageBody> | null = null;
    try {
      result = JSON.parse(value);
    } catch (err) {
      this.removeStoredAuthReplyMessage();
    }
    return result;
  }

  private startPing(interval: number): void {
    window.clearInterval(this.state.pingTimerHandle);
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
