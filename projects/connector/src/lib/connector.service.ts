import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// import { Message } from '../messages/declarations/message';

@Injectable({
  providedIn: 'root'
})
export class ConnectorService {
  // private ws!: WebSocket;
  private settings!: ConnectorSettings;
  private messageSubject = new Subject<any>();
  private connectedSubject = new Subject<void>();
  private errorSubject = new Subject<any>();
  private messageErrorSubject = new Subject<any>();
  private closeSubject = new Subject<any>();
  private state!: ConnectorServiceState;

  start(settings: ConnectorSettings): void {
    this.settings = settings;
    this.state = {};
    this.connect();
  }

  // sendMessage<TBody>(msg: Message<TBody>): void {
  sendMessage(msg: any): boolean {
    // const array = this.toBinary(msg);
    if (!this.state.ws) {
      return false;
    }
    try {
      const stringifiedMsg = JSON.stringify(msg);
      this.state.ws.send(stringifiedMsg);
      return true;
    } catch (err) {
      this.messageErrorSubject.next(err);
      return false;
    }
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

  // private sendArray(arr: Uint8Array): void {
  //   try {
  //     this.state.ws?.send(arr);
  //   } catch (err) { }
  // }

  private connect(): void {
    this.state.ws = new WebSocket(this.settings.url);
    const ws = this.state.ws;
    ws.onopen = ev => {
      this.connectedSubject.next();
    };
    ws.onmessage = msgEv => {
      // try {
      this.messageSubject.next(msgEv.data);
      // } catch (err) {
      //   this.messageErrorSubject.next(err);
      // }
    };
    ws.onerror = ev => {
      this.scheduleConnect();
      this.errorSubject.next(ev);
    };
    ws.onclose = ev => {
      this.scheduleConnect();
      this.closeSubject.next(ev);
    };
  }

  private scheduleConnect(): void {
    if (this.state.reconnectTimer) {
      clearInterval(this.state.reconnectTimer);
    }
    this.state.reconnectTimer = window.setTimeout(() => {
      this.connect();
    }, this.settings.reconnectDelay);
  }

  // private toBinary(obj: Record<string | number, any>): Uint8Array {
  //   const string = JSON.stringify(obj);
  //   const te = new TextEncoder();
  //   const array = te.encode(string);
  //   return array;
  // }
}

export interface ConnectorSettings {
  url: string;
  reconnectDelay: number;
}

interface ConnectorServiceState {
  ws?: WebSocket;
  reconnectTimer?: number;
}
