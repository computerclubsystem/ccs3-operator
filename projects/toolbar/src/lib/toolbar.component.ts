import { ChangeDetectionStrategy, Component, DestroyRef, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslocoPipe } from '@jsverse/transloco';

import { InternalSubjectsService } from '@ccs3-operator/shared';
import { IconName, MenuItem, MainMenuItem, AccountMenuItem } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, TranslocoPipe],
  templateUrl: 'toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly signals = this.createSignals();
  readonly languageMenuItems = this.createLanguageMenuItems();
  iconName = IconName;

  private readonly destroyRef = inject(DestroyRef);

  onMainMenuItemClick(mainMenuItem: MainMenuItem): void {
    this.internalSubjectsSvc.setMainMenuSelected(mainMenuItem);
  }

  onAccountMenuItemClick(accountMenuItem: AccountMenuItem): void {
    this.internalSubjectsSvc.setAccountMenuSelected(accountMenuItem);
  }

  onLanguageMenuItemClick(languageMenuItem: LanguageMenuItem): void {
    this.internalSubjectsSvc.setLanguageSelected(languageMenuItem.id);
  }

  createSignals(): Signals {
    const signals: Signals = {
      mainMenuItems: toSignal(this.internalSubjectsSvc.getMainMenuItems()),
      accountMenuItems: toSignal(this.internalSubjectsSvc.getAccountMenuItems()),
      isConnected: toSignal(this.internalSubjectsSvc.getConnected()),
    };
    return signals;
  }

  createLanguageMenuItems(): LanguageMenuItem[] {
    const languageMenuItems: LanguageMenuItem[] = [
      { id: LanguageMenuItemId.en, text: 'English' },
      { id: LanguageMenuItemId.bg, text: 'Български' },
    ];
    return languageMenuItems;
  }
}

interface Signals {
  mainMenuItems: Signal<MainMenuItem[] | undefined>;
  accountMenuItems: Signal<AccountMenuItem[] | undefined>;
  isConnected: Signal<boolean | undefined>;
}

type LanguageMenuItem = MenuItem<LanguageMenuItemId>;

const enum LanguageMenuItemId {
  en = 'en',
  bg = 'bg',
}
