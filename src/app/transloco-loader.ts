import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';
// import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  // private http = inject(HttpClient);
  private http = inject(FetchClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(`/assets/i18n/${lang}.json`);
  }
}

@Injectable({ providedIn: 'root' })
class FetchClient {
  async get<TResult>(url: string): Promise<TResult> {
    const fetchResult = await fetch(url);
    const result: TResult = await fetchResult.json();
    return result;
  }
}
