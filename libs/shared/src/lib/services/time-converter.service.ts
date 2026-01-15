import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimeConverterService {
  getDateTimeForHTMLInputString(date: Date): string {
    const getPadded = (value: number) => value.toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    // getMonth() starts from 0 for January
    const month = getPadded(date.getMonth() + 1);
    const day = getPadded(date.getDate());
    const hour = getPadded(date.getHours());
    const minute = getPadded(date.getMinutes());
    const result = `${year}-${month}-${day}T${hour}:${minute}`;
    return result;
  }

  convertTimeToMinutes(time?: string | null): number {
    if (!time) {
      return 0;
    }
    const trimmedDuration = time.trim();
    const parts = trimmedDuration.split(':');
    const hours = +parts[0];
    const minutes = +parts[1];
    return hours * 60 + minutes;
  }

  convertMinutesToTime(value?: number | null): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    const padValue = (value: number): string => value.toString().padStart(2, '0');
    const zeroPaddedMinutes = padValue(minutes);
    const zeroPaddedHours = padValue(hours);
    const result = `${zeroPaddedHours}:${zeroPaddedMinutes}`;
    return result;
  }
}
