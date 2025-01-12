import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorsService {
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
