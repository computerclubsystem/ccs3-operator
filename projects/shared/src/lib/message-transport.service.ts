import { inject, Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Message } from '@ccs3-operator/messages';
import { MessageSubjectsService } from './message-subjects.service';

@Injectable({ providedIn: 'root' })
export class MessageTransportService {
  private subjectsService = inject(MessageSubjectsService);
  private token?: string;
  private sendMessageSubject = new Subject<Message<any>>();

  setToken(token?: string): void {
    this.token = token;
  }

  sendMessage<TBody>(message: Message<TBody>): void {
    // The sole purpose of this method is to act as message send interceptor and set the token to every message
    message.header.token = this.token;
    // this.subjectsService.getAppMessageSendSubject().next(message);
    this.sendMessageSubject.next(message);
  }

  /**
   * Use this to get observable that will emit when some component sends a message
   * Listener should redirect the message to the service, that will actually send the message
   * @returns
   */
  getSendMessageObservable<TBody>(): Observable<Message<TBody>> {
    return this.sendMessageSubject.asObservable();
  }

  getMessageReceivedObservable<TBody>(): Observable<Message<TBody>> {
    return this.subjectsService.getAppMessageReceivedObservable();
  }
}
