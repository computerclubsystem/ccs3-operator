import { inject, Injectable } from '@angular/core';
import { catchError, first, Observable, Subject, throwError, timeout } from 'rxjs';

import { Message, MessageType } from '@ccs3-operator/messages';
import { MessageSubjectsService } from './message-subjects.service';
import { RequestReplyTypeService } from './request-reply-type.service';
import { InternalSubjectsService } from './internal-subjects.service';
import { MessageTimedOutErrorData } from './types';

@Injectable({ providedIn: 'root' })
export class MessageTransportService {
  private readonly subjectsService = inject(MessageSubjectsService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly requestReplyTypeSvc = inject(RequestReplyTypeService);
  private readonly sendMessageSubject = new Subject<Message<any>>();
  private token?: string;
  private timeout = 5000;

  /**
   * Sends requestMessage and emits the first received message that has the same correlationId.
   * If requestMessage.header.correlationId is empty, new one will be generated
   * @param requestMessage Message to send. If it does not have correlationId, random one will be assigned
   * @returns First received message that has the same correlationId as requestMessage.header.correlationId
   */
  sendAndAwaitForReply<TRequestMessageBody>(requestMessage: Message<TRequestMessageBody>): Observable<any> {
    if (!requestMessage.header.correlationId) {
      requestMessage.header.correlationId = this.createCorrelationId();
    }
    const requestCorrelationId = requestMessage.header.correlationId;
    return this.sendMessage(requestMessage).pipe(
      first(replyMessage => replyMessage.header.correlationId === requestCorrelationId)
    );
  }

  /**
   * Sends requestMessage and will emit the first received message of matching type.
   * For example if requestMessage.header.type is 'auth-request', it will emit the first received message of type 'auth-reply'
   * Will emit error if the specified or the global timeout occurs
   * @param timeoutDuration
   * @param requestMessage
   * @returns First received message that has mathing type
   */
  sendAndAwaitForReplyByType<TRequestMessageBody>(requestMessage: Message<TRequestMessageBody>, timeoutDuration?: number): Observable<any> {
    const replyType = this.requestReplyTypeSvc.getReplyType(requestMessage.header.type);
    const timeoutValue = timeoutDuration || this.timeout;
    const sentAt = Date.now();
    return this.sendMessage(requestMessage).pipe(
      timeout(timeoutValue),
      first(replyMessage => replyMessage.header.type === replyType),
      catchError(err => {
        this.internalSubjectsSvc.setMessageTimedOut(this.createMessageTimedOutErrorData(requestMessage, sentAt, timeoutValue, replyType));
        return throwError(() => err);
      })
    );
  }

  sendMessage<TRequestBody, TReplyBody = any>(message: Message<TRequestBody>): Observable<Message<TReplyBody>> {
    // The sole purpose of this method is to act as message send interceptor and set the token to every message
    message.header.token = this.token;
    this.sendMessageSubject.next(message);
    return this.getMessageReceivedObservable();
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

  setToken(token?: string): void {
    this.token = token;
  }

  getToken(): string | undefined {
    return this.token;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  getTimeout(): number {
    return this.timeout;
  }

  createCorrelationId(): string {
    return crypto.randomUUID();
  }

  private createMessageTimedOutErrorData(requestMessage: Message<any>, sentAt: number, timeoutValue: number, expectedReplyType?: MessageType): MessageTimedOutErrorData {
    const messageTimedoutData: MessageTimedOutErrorData = {
      message: requestMessage,
      sentAt: sentAt,
      timeout:
        timeoutValue,
      expectedReplyType: expectedReplyType,
    };
    return messageTimedoutData;
  }
}
