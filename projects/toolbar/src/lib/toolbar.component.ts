import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, signal, Signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { TranslocoPipe } from '@jsverse/transloco';

import { InternalSubjectsService } from '@ccs3-operator/shared';
import { IconName, MenuItem, MainMenuItem, AccountMenuItem } from '@ccs3-operator/shared/types';
import { GetProfileSettingsReplyMessage } from '@ccs3-operator/messages';

@Component({
  selector: 'ccs3-op-toolbar',
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, TranslocoPipe],
  templateUrl: 'toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit {
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly signals = this.createSignals();
  readonly languageMenuItems = this.createLanguageMenuItems();
  iconName = IconName;

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.internalSubjectsSvc.getSignedIn().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isSignedIn => this.processSignedInChanged(isSignedIn));
    this.internalSubjectsSvc.getProfileSettingsReplyMessage().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(replyMsg => this.processGetProfileSettingsReplyMessage(replyMsg));
  }

  processGetProfileSettingsReplyMessage(replyMsg: GetProfileSettingsReplyMessage | null): void {
    if (!replyMsg || replyMsg.header.failure) {
      this.signals.username.set('');
      return;
    }
    this.signals.username.set(replyMsg.body.username);
  }

  processSignedInChanged(isSignedIn: boolean): void {
    if (!isSignedIn) {
      this.signals.username.set('');
    }
  }

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
      username: signal(''),
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
  username: WritableSignal<string>;
}

type LanguageMenuItem = MenuItem<LanguageMenuItemId>;

const enum LanguageMenuItemId {
  en = 'en',
  bg = 'bg',
}
