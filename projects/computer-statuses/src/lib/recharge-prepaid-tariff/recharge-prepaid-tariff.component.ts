import { Component, DestroyRef, inject, input, OnInit, output, signal, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoDirective } from '@jsverse/transloco';

import { Tariff } from '@ccs3-operator/messages';
import { TimeConverterService } from '@ccs3-operator/shared';

@Component({
  selector: 'ccs3-op-recharge-prepaid-tariff',
  templateUrl: 'recharge-prepaid-tariff.component.html',
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatCheckboxModule, MatButtonModule, TranslocoDirective
  ],
})
export class RechargePrepaidTariffComponent implements OnInit {
  prepaidTariffs = input<Tariff[]>();
  resultDescription = input<string | null>(null);
  readonly rechargeTariff = output<Tariff>();
  readonly selectedTariffChanged = output<Tariff>();

  private readonly timeConverterSvc = inject(TimeConverterService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  readonly form = this.createForm();
  readonly signals = this.createSignals();

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
    };
    return signals;
  }
}

interface Signals {
  tariffInfo: WritableSignal<PrepaidTariffInfo | null>;
}

interface FormControls {
  tariff: FormControl<Tariff | null>;
  allowRecharge: FormControl<boolean | null>;
}

interface PrepaidTariffInfo {
  duration: string;
  price: number;
}
