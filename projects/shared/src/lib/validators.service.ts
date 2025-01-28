import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorsService {
  durationValidator(control: AbstractControl): ValidationErrors {
    if (typeof control.value !== 'string') {
      return { notString: true } as ValidationErrors;
    }
    const valueAsString = control.value as string;
    if (!valueAsString?.trim()) {
      return { notString: true } as ValidationErrors;
    }
    const parts = valueAsString.trim().split(':');
    if (parts.length !== 2) {
      return { notTwoParts: true } as ValidationErrors;
    }
    if (!parts[0].trim() || !parts[1].trim()) {
      return { notTwoParts: true } as ValidationErrors;
    }

    for (const ch of valueAsString) {
      const isAllowed = ch === ':' || (ch >= '0' && ch <= '9');
      if (!isAllowed) {
        return { invalidChar: true } as ValidationErrors;
      }
    }

    const hours = parseInt(parts[0]);
    const minutes = parseInt(parts[1]);
    if (hours < 0 || minutes < 0 || minutes > 59) {
      return { outOfRange: true } as ValidationErrors;
    }
    return {};
  };

  priceValidator(control: AbstractControl): ValidationErrors {
    const valueAsNumber: number = control.value;
    if (isNaN(valueAsNumber)) {
      return { notNumber: true } as ValidationErrors;
    }
    if (valueAsNumber <= 0) {
      return { notPositive: true } as ValidationErrors;
    }
    const parts = valueAsNumber.toString().split('.');
    if (parts.length > 2) {
      return { notNumber: true } as ValidationErrors;
    }
    if (parts.length === 2 && parts[1].length > 2) {
      return { moreThanTwoFractionalDigits: true } as ValidationErrors;
    }
    return {};
  };

  noWhiteSpace(control: AbstractControl): ValidationErrors {
    const result: { noWhiteSpace?: boolean } = {};
    const value = control.value || '';
    if (!value) {
      result.noWhiteSpace = true;
      return result;
    }

    if (typeof value !== 'string') {
      result.noWhiteSpace = true;
      return result;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
      result.noWhiteSpace = true;
      return result;
    }

    return result;
  }
}
