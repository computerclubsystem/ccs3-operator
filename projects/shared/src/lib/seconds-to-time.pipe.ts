import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'secondsToTime', standalone: true })
export class SecondsToTimePipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    const totalSeconds = +value;
    if (isNaN(totalSeconds) || totalSeconds === 0) {
      return '0:00';
    }
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = totalSeconds % 60;

    const zeroPaddedMinutes = this.padValue(minutes);
    const zeroPaddedSeconds = this.padValue(seconds);
    const result = `${hours}:${zeroPaddedMinutes}:${zeroPaddedSeconds}`;
    return result;
  }

  padValue(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
