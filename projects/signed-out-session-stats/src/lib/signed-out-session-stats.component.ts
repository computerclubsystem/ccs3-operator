import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoDirective } from '@jsverse/transloco';

import { InternalSubjectsService, RouteNavigationService } from '@ccs3-operator/shared';
import { Router } from '@angular/router';

@Component({
  selector: 'ccs3-op-signed-out-session-stats',
  imports: [MatCardModule, MatButtonModule, TranslocoDirective, DatePipe],
  templateUrl: 'signed-out-session-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignedOutSessionStatsComponent {
  readonly internalSubjectsSvc = inject(InternalSubjectsService);
  readonly signedOutReplyMessage = toSignal(this.internalSubjectsSvc.getSignOutReplyMessage());

  private readonly routeNavigationSvc = inject(RouteNavigationService);

  onNavigateToSignIn(): void {
    this.routeNavigationSvc.navigateToSignInRequested();
  }
}
