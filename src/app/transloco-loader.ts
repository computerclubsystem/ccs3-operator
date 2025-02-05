import { Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

import { staticTranslations } from './static-translations/static-translations';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  async getTranslation(lang: string): Promise<Translation> {
    const staticTranslationForSelectedLanguage = (staticTranslations as Record<string, unknown>)[lang];
    if (staticTranslationForSelectedLanguage) {
      return staticTranslationForSelectedLanguage;
    }

    const url = `/assets/i18n/${lang}.json`;
    try {
      const fetchResult = await fetch(url);
      const result: Translation = await fetchResult.json();
      return result;
    } catch {
      // In case of fetch error, we will return empty object so the application does not fail to load
      // just because Transloco can't load the translations
      // Returning empty object will at least show the translation keys
      // TODO: Find a way to return the default language
      return {} as Translation;
    }
  }
}
