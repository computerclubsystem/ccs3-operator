import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouteNavigationService } from '@ccs3-operator/shared';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'ccs3-op-signed-out-by-administrator',
  templateUrl: 'signed-out-by-administrator.html',
  imports: [MatButtonModule, TranslocoDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignedOutByAdministratorComponent {
  private readonly routeNavigationSvc = inject(RouteNavigationService);

  onNavigateToSignIn(): void {
    this.routeNavigationSvc.navigateToSignInRequested();
  }
}
