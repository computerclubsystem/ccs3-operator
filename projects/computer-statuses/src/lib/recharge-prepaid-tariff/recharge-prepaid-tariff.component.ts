import { Component, computed, DestroyRef, inject, input, OnInit, output, Signal, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';

import { Tariff } from '@ccs3-operator/messages';
import { SorterService, TimeConverterService } from '@ccs3-operator/shared';
import { IconName } from '@ccs3-operator/shared/types';

@Component({
  selector: 'ccs3-op-recharge-prepaid-tariff',
  templateUrl: 'recharge-prepaid-tariff.component.html',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule, MatExpansionModule, MatIconModule, TranslocoDirective
  ],
})
export class RechargePrepaidTariffComponent implements OnInit {
  private readonly sorterSvc = inject(SorterService);
  prepaidTariffs = input<Tariff[]>();
  resultDescription = input<string | null>(null);
  readonly rechargeTariff = output<Tariff>();
  readonly selectedTariffChanged = output<Tariff>();

  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.createForm();
  readonly signals = this.createSignals();
  readonly iconName = IconName;

  ngOnInit(): void {
    this.subscribeToFormChanges();
  }

  subscribeToFormChanges(): void {
    this.form.controls.tariff.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(tariff => this.processTariffChange(tariff));
  }

  onRecharge(tariff: Tariff): void {
    this.rechargeTariff.emit(tariff);
  }

  processTariffChange(tariff: Tariff | null): void {
    if (!tariff) {
      this.signals.tariffInfo.set(null);
      return;
    }
    this.selectedTariffChanged.emit(tariff);
    const durationText = this.timeConverterSvc.convertMinutesToTime(tariff.duration);
    const tariffInfo: PrepaidTariffInfo = {
      duration: durationText || '',
      price: tariff.price,
    };
    this.signals.tariffInfo.set(tariffInfo);
  }

  toggleTariffSortProperty(): void {
    const current = this.signals.tariffSortProperty();
    const newSort = current === TariffSortProperty.id ? TariffSortProperty.name : TariffSortProperty.id;
    this.signals.tariffSortProperty.set(newSort);
  }

  createForm(): FormGroup<FormControls> {
    const formControls: FormControls = {
      tariff: new FormControl(null, { validators: [Validators.required] }),
      allowRecharge: new FormControl(false),
    };
    const form = this.formBuilder.group<FormControls>(formControls);
    return form;
  }

  createSignals(): Signals {
    const signals: Signals = {
      tariffInfo: signal(null),
      tariffSortProperty: signal(TariffSortProperty.id),
    } as Signals;
    signals.sortedPrepaidTariffs = computed(() => {
      const inputTariffs = this.prepaidTariffs();
      const sortProp = signals.tariffSortProperty();
      if (!inputTariffs) {
        return [];
      }
      const sortedTariffs = [...inputTariffs];
      let sortKeySelector: (t: Tariff) => string | number;
      if (sortProp === TariffSortProperty.name) {
        sortKeySelector = x => x.name;
      } else if (sortProp === TariffSortProperty.id) {
        sortKeySelector = x => x.id;
      } else {
        sortKeySelector = x => x.name;
      }
      this.sorterSvc.sortBy(sortedTariffs, sortKeySelector);
      return sortedTariffs;
    });
    return signals;
  }
}

interface Signals {
  tariffInfo: WritableSignal<PrepaidTariffInfo | null>;
  tariffSortProperty: WritableSignal<TariffSortProperty>;
  sortedPrepaidTariffs: Signal<Tariff[]>;
}

interface FormControls {
  tariff: FormControl<Tariff | null>;
  allowRecharge: FormControl<boolean | null>;
}

interface PrepaidTariffInfo {
  duration: string;
  price: number;
}

const enum TariffSortProperty {
  name = 'name',
  id = 'id',
}
