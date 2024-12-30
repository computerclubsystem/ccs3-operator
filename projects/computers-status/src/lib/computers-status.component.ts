import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'ccs3-op-computers-status',
  standalone: true,
  imports: [MatCardModule, MatButtonModule],
  templateUrl: 'computers-status.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComputersStatusComponent {

}
