import { FormControl } from '@angular/forms';

export interface FormControls {
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  enabled: FormControl<boolean | null>;
}
