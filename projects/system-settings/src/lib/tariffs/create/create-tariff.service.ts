import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CreateTariffService {
  convertDurationToNumber(duration: string): number {
    const trimmedDuration = duration.trim();
    const parts = trimmedDuration.split(':');
    const hours = +parts[0];
    const minutes = +parts[1];
    return hours * 60 + minutes;
  }
}
