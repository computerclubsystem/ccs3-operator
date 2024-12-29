import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import { ConfigurationMessage } from '@ccs3-operator/messages';

@Injectable({ providedIn: 'root' })
export class InternalSubjectsService {
  private readonly loggedInSubject = new ReplaySubject<boolean>(1);
  private readonly configurationMessageSubject = new ReplaySubject<ConfigurationMessage>(1);
  private readonly connectedSubject = new Subject<boolean>();
  private readonly signInRequestedSubject = new Subject<void>();
  private readonly navigateToNotificationsRequestedSubject = new Subject<void>();
  private readonly notificationsChangedSubject = new ReplaySubject<any>(1);

  setNotificationsChanged(notifications: any): void {
    this.notificationsChangedSubject.next(notifications);
  }

  getNotificationsChanged(): Observable<any> {
    return this.notificationsChangedSubject.asObservable();
  }

  navigateToNotificationsRequested(): void {
    this.navigateToNotificationsRequestedSubject.next();
  }

  getNavigateToNotificationsRequested(): Observable<void> {
    return this.navigateToNotificationsRequestedSubject.asObservable();
  }

  signInRequested(): void {
    this.signInRequestedSubject.next();
  }

  getSignInRequested(): Observable<void> {
    return this.signInRequestedSubject.asObservable();
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

  setLoggedIn(value: boolean): void {
    this.loggedInSubject.next(value);
  }

  getLoggedIn(): Observable<boolean> {
    return this.loggedInSubject.asObservable();
  }
}
