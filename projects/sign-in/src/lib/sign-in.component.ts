import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';
import { filter } from 'rxjs';

import { AuthReplyMessage, createAuthRequestMessage, MessageType } from '@ccs3-operator/messages';
import { InternalSubjectsService, MessageTransportService } from '@ccs3-operator/shared';

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
  internalSubjectsSvc = inject(InternalSubjectsService);
  signals = this.createSignals();

  private readonly destroyRef = inject(DestroyRef);
  private signInInitiated = false;

  ngOnInit(): void {
    this.formGroup = this.createForm();
  }

  async onSignIn(): Promise<void> {
    this.signInInitiated = true;
    this.subscribeToSubjects();
    this.signals.showAuthFailed.set(false);
    const formValue = this.formGroup.value;
    const authRequestMsg = createAuthRequestMessage();
    authRequestMsg.body.username = formValue.username!;
    authRequestMsg.body.passwordHash = await this.getSha512(formValue.password!);
    this.internalSubjectsSvc.setSignInRequested(authRequestMsg);
  }

  subscribeToSubjects(): void {
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => msg.header.type === MessageType.authReply),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(msg => this.processAuthReplyMessage(msg as AuthReplyMessage));
  }

  processAuthReplyMessage(message: AuthReplyMessage): void {
    this.signals.showAuthFailed.set(!message.body.success);
    if (this.signInInitiated && message.body.success) {
      // If the user initiated the sign in and the authentication is successful, navigate away the sign-in route
      this.internalSubjectsSvc.setManualAuthSucceeded();
    }
  }

  createForm(): FormGroup {
    const formGroup = this.formBuilder.group<SignInFormControls>({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
    return formGroup;
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
      isConnected: toSignal(this.internalSubjectsSvc.getConnected()),
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
  isConnected: Signal<boolean | undefined>;
}
