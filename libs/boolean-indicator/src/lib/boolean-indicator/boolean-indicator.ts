import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { IconName } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-boolean-indicator',
  templateUrl: 'boolean-indicator.html',
  imports: [MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BooleanIndicatorComponent {
  value = input<boolean | undefined | null>(false);

  readonly iconName = IconName;
}
