import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-diagnostics',
  templateUrl: 'diagnostics.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, TranslocoDirective, TranslocoPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiagnosticsComponent {
  readonly signals = this.createSignals();

  createSignals(): Signals {
    const links: Link[] = [
      { routerLink: 'filter-server-logs', translationKey: 'Filter server logs' },
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
