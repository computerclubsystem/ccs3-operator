import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Message } from '../messages/declarations/message';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  private ws!: WebSocket;
  private settings!: ConnectorSettings;
  private messageSubject = new Subject<any>();
  private connectedSubject = new Subject<void>();
  private errorSubject = new Subject<any>();
  private messageErrorSubject = new Subject<any>();
  private closeSubject = new Subject<any>();

  start(settings: ConnectorSettings): void {
    this.settings = settings;
    this.connect();
  }

  sendMessage<TBody>(msg: Message<TBody>): void {
    // const array = this.toBinary(msg);
    try {
      const stringifiedMsg = JSON.stringify(msg);
      this.ws.send(stringifiedMsg);
    } catch (err) { }
  }

  getMessageObservable(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  getMessageErrorObservable(): Observable<any> {
    return this.messageErrorSubject.asObservable();
  }

  getConnectedObservable(): Observable<void> {
    return this.connectedSubject.asObservable();
  }

  getErrorObservable(): Observable<any> {
    return this.errorSubject.asObservable();
  }

  getClosedObservable(): Observable<any> {
    return this.closeSubject.asObservable();
  }

  private sendArray(arr: Uint8Array): void {
    try {
      this.ws.send(arr);
    } catch (err) { }
  }

  private connect(): void {
    this.ws = new WebSocket(this.settings.url);
    const ws = this.ws;
    ws.onopen = ev => {
      this.connectedSubject.next();
    };
    ws.onmessage = msgEv => {
      try {
        console.log(msgEv);
      } catch (err) {
        this.messageErrorSubject.next(err);
      }
    };
    ws.onerror = ev => {
      this.errorSubject.next(ev);
    };
    ws.onclose = ev => {
      this.closeSubject.next(ev);
    };
  }

  private toBinary(obj: Record<string | number, any>): Uint8Array {
    const string = JSON.stringify(obj);
    const te = new TextEncoder();
    const array = te.encode(string);
    return array;
  }
}

export interface ConnectorSettings {
  url: string;
}
