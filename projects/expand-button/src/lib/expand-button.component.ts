import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-expand-button',
  templateUrl: 'expand-button.component.html',
  imports: [NgTemplateOutlet, NgClass, MatButtonModule, MatIconModule],
})
export class ExpandButtonComponent {
  isExpanded = input<boolean | undefined | null>(false);
  disabled = input<boolean | undefined | null>(false);
  type = input<ExpandButtonType>(ExpandButtonType.matButton);
  buttonElementClass = input<string | undefined | null>();

  iconName = IconName;
  btnType = ExpandButtonType;
}

export enum ExpandButtonType {
  matButton = 'mat-button',
  matFlatButton = 'mat-flat-button',
  matRaisedButton = 'mat-raised-button',
  matStrokedButton = 'mat-stroked-button',
  matIconButton = 'mat-icon-button',
}
