import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, Subject } from 'rxjs';

import { Message } from '@ccs3-operator/messages';

@Injectable({
  providedIn: 'root'
})
export class MessageSubjectsService {
  private readonly appMessageReceivedSubject = new ReplaySubject<any>(1);
  private readonly appMessageSendSubject = new Subject<any>();

  /**
   * Returns the subject that is used to send messages.
   * Do not use this directly - use MessageSenderService.sendMessage instead
   * @returns
   */
  getAppMessageSendSubject<TBody>(): Subject<Message<TBody>> {
    return this.appMessageSendSubject;
  }

  /**
   * Returns the observable that will emit when MessageSenderService.sendMessage is called
   * @returns
   */
  getAppMessageSendObservable<TBody>(): Observable<Message<TBody>> {
    return this.appMessageSendSubject.asObservable();
  }

  getAppMessageReceivedSubject(): ReplaySubject<any> {
    return this.appMessageReceivedSubject;
  }

  getAppMessageReceivedObservable(): Observable<any> {
    return this.appMessageReceivedSubject.asObservable();
  }
}
