import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

import { IconName, InternalSubjectsService } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-toolbar',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: 'toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent {
  internalSubjectsSvc = inject(InternalSubjectsService);

  iconName = IconName;

  onShowNotifications(): void {
    this.internalSubjectsSvc.navigateToNotificationsRequested();
  }

  onSignIn(): void {
    this.internalSubjectsSvc.signInRequested();
  }
}
