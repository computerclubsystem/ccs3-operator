import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageSubjectsService {
  private readonly appMessageReceivedSubject = new Subject<unknown>();

  getAppMessageReceivedSubject(): Subject<unknown> {
    return this.appMessageReceivedSubject;
  }

  getAppMessageReceivedObservable<TBody>(): Observable<TBody> {
    return this.appMessageReceivedSubject.asObservable() as Observable<TBody>;
  }
}
