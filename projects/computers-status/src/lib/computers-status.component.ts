import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ccs3-op-computers-status',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, NgTemplateOutlet],
  templateUrl: 'computers-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComputersStatusComponent {
  computerCardDataIdentity = (obj: ComputerCardData) => obj;
  statusItems = signal<ComputerCardData[]>([
    { name: 'PC 10', isStarted: true, total: 12.50, tariffName: 'Дневен пакет' },
    { name: 'PC 11', isStarted: false, total: 8.00, tariffName: 'Нощен пакет' },
    { name: 'PC 12', isStarted: false, total: 4.50, tariffName: 'Пакет 10 лв.' },
    { name: 'PC 20', isStarted: true, total: 2.00, tariffName: 'Пакет 10:00 - 14:00' },
    { name: 'PC 21', isStarted: true, total: 6.50, tariffName: 'Пакет 3 часа - 6 лева' },
  ]);
}

interface ComputerCardData {
  isStarted: boolean;
  name: string;
  tariffName: string;
  total: number;
}
