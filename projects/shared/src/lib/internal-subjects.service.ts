import { Injectable } from '@angular/core';
import { ConfigurationMessage } from '@ccs3-operator/messages';
import { Observable, ReplaySubject, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InternalSubjectsService {
  private readonly loggedInSubject = new ReplaySubject<boolean>(1);
  private readonly configurationMessageSubject = new ReplaySubject<ConfigurationMessage>(1);
  private readonly connectedSubject = new Subject<boolean>();

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
