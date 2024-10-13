import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';

import { WebAppConfig } from './web-app-config';

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {
  private readonly webAppConfigSubject = new ReplaySubject<WebAppConfig>(1);

  getWebAppConfigSubject(): ReplaySubject<WebAppConfig> {
    return this.webAppConfigSubject;
  }

  getWebAppConfigObservable(): Observable<WebAppConfig> {
    return this.webAppConfigSubject.asObservable();
  }
}
