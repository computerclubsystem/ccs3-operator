import { Component, signal, WritableSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-system-settings',
  templateUrl: 'system-settings.component.html',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, TranslocoPipe],
})
export class SystemSettingsComponent {
  readonly signals = this.createSignals();

  createSignals(): Signals {
    const links: Link[] = [
      { routerLink: 'devices', translationKey: 'Devices' },
      { routerLink: 'tariffs', translationKey: 'Tariffs' },
      { routerLink: 'prepaid-tariffs', translationKey: 'Prepaid tariffs' },
      { routerLink: 'users', translationKey: 'Users' },
      { routerLink: 'roles', translationKey: 'Roles' },
      // { routerLink: 'system-variables', translationKey: 'System variables' },
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
