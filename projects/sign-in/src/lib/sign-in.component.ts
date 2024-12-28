import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { MessageType, Message, AuthReplyMessage } from '@ccs3-operator/messages';
import { createAuthRequestMessage } from '@ccs3-operator/messages';
import { MessageTransportService } from '@ccs3-operator/shared';

@Component({
  imports: [
    ReactiveFormsModule,
    // AsyncPipe,
    MatInputModule,
    MatButtonModule,
    TranslocoModule,
    TranslocoDirective
  ],
  templateUrl: 'sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent implements OnInit {
  formGroup!: FormGroup<SignInFormControls>;
  formBuilder = inject(FormBuilder);
  messageTransportSvc = inject(MessageTransportService);
  signals = this.createSignals();

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.subscribeToSubjects();
  }

  async onSignIn(): Promise<void> {
    this.signals.showAuthFailed.set(false);
    const formValue = this.formGroup.value;
    const msg = createAuthRequestMessage();
    msg.body.username = formValue.username!;
    msg.body.passwordHash = await this.getSha512(formValue.password!);
    this.messageTransportSvc.sendMessage(msg);
  }

  createForm(): FormGroup {
    const formGroup = this.formBuilder.group<SignInFormControls>({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
    return formGroup;
  }

  subscribeToSubjects(): void {
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => msg.header.type === MessageType.authReply),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(msg => this.processAuthReplyMessage(msg as AuthReplyMessage));
  }

  // processAppMessage<TBody>(message: Message<TBody>): void {
  //   const type = message.header.type;
  //   switch (type) {
  //     case MessageType.authReply:
  //       this.processAuthReplyMessage(message as AuthReplyMessage);
  //       break;
  //   }
  // }

  processAuthReplyMessage(message: AuthReplyMessage): void {
    this.messageTransportSvc.setToken(message.body.token);
    this.signals.showAuthFailed.set(!message.body.success);
  }

  async getSha512(text: string): Promise<string> {
    // From https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
    const msgUint8 = new TextEncoder().encode(text);
    const hashBuffer = await window.crypto.subtle.digest('sha-512', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex;
  }

  createSignals(): Signals {
    const signals: Signals = {
      showAuthFailed: signal(false),
    };
    return signals;
  }
}

interface SignInFormControls {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}

interface Signals {
  showAuthFailed: WritableSignal<boolean>;
}
