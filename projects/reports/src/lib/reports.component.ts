import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-reports',
  templateUrl: 'reports.component.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsComponent {
  readonly signals = this.createSignals();

  createSignals(): Signals {
    const links: Link[] = [
      { routerLink: 'shifts', translationKey: 'Shifts' },
      { routerLink: 'device-sessions', translationKey: 'Device sessions' },
      { routerLink: 'signed-in-users', translationKey: 'Signed in users' },
    ];
    const signals: Signals = {
      links: signal(links),
    };
    return signals;
  }
}

interface Signals {
  links: WritableSignal<Link[]>;
}

interface Link {
  routerLink: string;
  translationKey: string;
}
