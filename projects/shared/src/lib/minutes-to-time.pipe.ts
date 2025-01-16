import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'minutesToTime', standalone: true })
export class MinutesToTimePipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    const totalMinutes = +value;
    if (isNaN(totalMinutes) || totalMinutes === 0) {
      return '0:00';
    }
    const totalSeconds = totalMinutes * 60;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    const zeroPaddedMinutes = minutes.toString().padStart(2, '0');
    const result = `${hours}:${zeroPaddedMinutes}`;
    return result;
  }
}
