import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
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
  expandedButtonElementClass = input<string | undefined | null>('expand-button-expanded');
  collapsedButtonElementClass = input<string | undefined | null>('expand-button-collapsed');
  computedButtonElementClass = computed(() => {
    const buttonElementClassValue = this.buttonElementClass();
    const expandedButtonElementClassValue = this.expandedButtonElementClass();
    const collapsedButtonElementClassValue = this.collapsedButtonElementClass();
    const isExpandedValue = this.isExpanded();
    const classValues = [];
    if (buttonElementClassValue) {
      classValues.push(buttonElementClassValue);
    }
    if (isExpandedValue && expandedButtonElementClassValue) {
      classValues.push(expandedButtonElementClassValue);
    }
    if (!isExpandedValue && collapsedButtonElementClassValue) {
      classValues.push(collapsedButtonElementClassValue);
    }
    return classValues;
  });

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
