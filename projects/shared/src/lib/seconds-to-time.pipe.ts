import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'secondsToTime', standalone: true })
export class SecondsToTimePipe implements PipeTransform {

  transform(value: any, ...args: any[]) {
    const totalSeconds = +value;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
    const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

    const minutesAndSecondsText = [minutes, seconds].map(x => x.toString().padStart(2, '0'));
    const prefix = hours > 0 ? `${hours}:` : '';
    const result = prefix + minutesAndSecondsText.join(':');
    return result;
  }
}
