import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatCardModule } from '@angular/material/card';
import { TranslocoPipe } from '@jsverse/transloco';

import { InternalSubjectsService } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-signed-out-session-stats',
  imports: [MatCardModule, TranslocoPipe, DatePipe],
  templateUrl: 'signed-out-session-stats.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignedOutSessionStatsComponent {
  internalSubjectsSvc = inject(InternalSubjectsService);
  signedOutReplyMessage = toSignal(this.internalSubjectsSvc.getSignOutReplyMessage());
}
