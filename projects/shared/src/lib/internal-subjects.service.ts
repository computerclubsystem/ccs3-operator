import { Injectable } from '@angular/core';
import { filter, first, Observable, ReplaySubject, Subject } from 'rxjs';

import { AuthRequestMessage, ConfigurationMessage, ReplyMessage, SignOutReplyMessage } from '@ccs3-operator/messages';
import { AccountMenuItem, MainMenuItem, MessageTimedOutErrorData } from './types';

@Injectable({ providedIn: 'root' })
export class InternalSubjectsService {
  private readonly signedInSubject = new ReplaySubject<boolean>(1);
  private readonly configurationMessageSubject = new ReplaySubject<ConfigurationMessage>(1);
  private readonly connectedSubject = new Subject<boolean>();
  private readonly notificationsChangedSubject = new ReplaySubject<any>(1);
  private readonly setMainMenuItemsSubject = new Subject<MainMenuItem[]>();
  private readonly mainMenuSelectedSubject = new Subject<MainMenuItem>();
  private readonly setAccountMenuItemsSubject = new Subject<AccountMenuItem[]>();
  private readonly accountMenuSelectedSubject = new Subject<AccountMenuItem>();
  private readonly languageSelectedSubject = new ReplaySubject<string>(1);
  private readonly signInRequestedSubject = new Subject<AuthRequestMessage>();
  private readonly manualAuthSucceededSubject = new Subject<void>();
  private readonly signOutReplyMessageSubject = new ReplaySubject<SignOutReplyMessage>(1);
  private readonly messageTimedOutSubject = new Subject<MessageTimedOutErrorData>();
  private readonly setFailureReplyMessageReceivedSubject = new Subject<ReplyMessage<any>>();

  setFailureReplyMessageReceived(msg: ReplyMessage<any>): void {
    this.setFailureReplyMessageReceivedSubject.next(msg);
  }

  getFailureReplyMessageReceived(): Observable<ReplyMessage<any>> {
    return this.setFailureReplyMessageReceivedSubject.asObservable();
  }

  setMessageTimedOut(messageTimedOutErrorData: MessageTimedOutErrorData): void {
    this.messageTimedOutSubject.next(messageTimedOutErrorData);
  }

  getMessageTimedOut(): Observable<MessageTimedOutErrorData> {
    return this.messageTimedOutSubject.asObservable();
  }

  setSignOutReplyMessage(signOutReplyMessage: SignOutReplyMessage): void {
    this.signOutReplyMessageSubject.next(signOutReplyMessage);
  }

  getSignOutReplyMessage(): Observable<SignOutReplyMessage> {
    return this.signOutReplyMessageSubject.asObservable();
  }

  setManualAuthSucceeded(): void {
    this.manualAuthSucceededSubject.next();
  }

  getManualAuthSucceeded(): Observable<void> {
    return this.manualAuthSucceededSubject.asObservable();
  }

  setSignInRequested(authRequestMessage: AuthRequestMessage): void {
    this.signInRequestedSubject.next(authRequestMessage);
  }

  getSignInRequested(): Observable<AuthRequestMessage> {
    return this.signInRequestedSubject.asObservable();
  }

  setLanguageSelected(language: string): void {
    this.languageSelectedSubject.next(language);
  }

  getLanguageSelected(): Observable<string> {
    return this.languageSelectedSubject.asObservable();
  }

  setAccountMenuItems(accountMenuItems: AccountMenuItem[]): void {
    this.setAccountMenuItemsSubject.next(accountMenuItems);
  }

  getAccountMenuItems(): Observable<AccountMenuItem[]> {
    return this.setAccountMenuItemsSubject.asObservable();
  }

  setAccountMenuSelected(accountMenuItem: AccountMenuItem): void {
    this.accountMenuSelectedSubject.next(accountMenuItem);
  }

  getAccountMenuSelected(): Observable<AccountMenuItem> {
    return this.accountMenuSelectedSubject.asObservable();
  }

  setMainMenuSelected(mainMenuItem: MainMenuItem): void {
    this.mainMenuSelectedSubject.next(mainMenuItem);
  }

  getMainMenuSelected(): Observable<MainMenuItem> {
    return this.mainMenuSelectedSubject.asObservable();
  }

  setMainMenuItems(mainMenuItems: MainMenuItem[]): void {
    this.setMainMenuItemsSubject.next(mainMenuItems);
  }

  getMainMenuItems(): Observable<MainMenuItem[]> {
    return this.setMainMenuItemsSubject.asObservable();
  }

  setNotificationsChanged(notifications: any): void {
    this.notificationsChangedSubject.next(notifications);
  }

  getNotificationsChanged(): Observable<any> {
    return this.notificationsChangedSubject.asObservable();
  }

  setConnected(isConnected: boolean): void {
    this.connectedSubject.next(isConnected);
  }

  getConnected(): Observable<boolean> {
    return this.connectedSubject.asObservable();
  }

  setConfigurationMessage(message: ConfigurationMessage): void {
    this.configurationMessageSubject.next(message);
  }

  getConfigurationMessage(): Observable<ConfigurationMessage> {
    return this.configurationMessageSubject.asObservable();
  }

  setSignedIn(value: boolean): void {
    this.signedInSubject.next(value);
  }

  getSignedIn(): Observable<boolean> {
    return this.signedInSubject.asObservable();
  }

  whenSignedIn(): Observable<boolean> {
    return this.signedInSubject.pipe(
      filter(isSignedIn => isSignedIn),
      first(),
    );
  }
}
