import { ApplicationConfig, isDevMode, provideZonelessChangeDetection } from '@angular/core';
import { DatePipe } from '@angular/common';
import { provideRouter } from '@angular/router';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';
import { provideTransloco, TRANSLOCO_MISSING_HANDLER, TranslocoMissingHandler, TranslocoMissingHandlerData } from '@jsverse/transloco';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

import { routes } from './app.routes';
import { TranslocoHttpLoader } from './transloco-loader';

export class IgnoreEnglishMissingHandler implements TranslocoMissingHandler {
  handle(key: string, config: TranslocoMissingHandlerData) {
    if (config.activeLang === 'en') {
      // English uses keys as translations - no warning
      return key;
    }

    // For all other languages - show real missing translation warnings
    console.warn(`Missing translation for '${key}' in '${config.activeLang}'`);
    return key;
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideTransloco({
      config: {
        availableLangs: ['en', 'bg'],
        defaultLang: 'en',
        fallbackLang: 'en',
        // Remove this option if your application doesn't support changing language in runtime.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: {
          logMissingKey: true,
          allowEmpty: true,
        },
      },
      loader: TranslocoHttpLoader
    }),
    provideTranslocoMessageformat(),
    {
      provide: TRANSLOCO_MISSING_HANDLER,
      useClass: IgnoreEnglishMissingHandler,
    },
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { subscriptSizing: 'dynamic' } as MatFormFieldDefaultOptions
    },
    DatePipe,
  ]
};
