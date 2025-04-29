import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, Signal, WritableSignal, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslocoDirective, TranslocoModule } from '@jsverse/transloco';
import QRCode from 'qrcode';
import { filter, interval } from 'rxjs';

import {
  AuthReplyMessage, createAuthRequestMessage, createCreateSignInCodeRequestMessage,
  CreateSignInCodeReplyMessage, CreateSignInCodeRequestMessageBody, MessageType,
  PublicConfigurationNotificationMessage
} from '@ccs3-operator/messages';
import { HashService, InternalSubjectsService, IsConnectedInfo, MessageTransportService } from '@ccs3-operator/shared';

@Component({
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    TranslocoModule,
    TranslocoDirective
  ],
  templateUrl: 'sign-in.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignInComponent implements OnInit {
  formGroup!: FormGroup<SignInFormControls>;
  private readonly formBuilder = inject(FormBuilder);
  private readonly messageTransportSvc = inject(MessageTransportService);
  private readonly internalSubjectsSvc = inject(InternalSubjectsService);
  private readonly hashSvc = inject(HashService);
  signals = this.createSignals();

  private lastConnectedAt?: number | null;
  private readonly destroyRef = inject(DestroyRef);
  private signInInitiated = false;

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.internalSubjectsSvc.getConnected().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(isConnectedInfo => this.processIsConnectedInfo(isConnectedInfo));
    this.internalSubjectsSvc.getPublicConfigurationNotificationMessage().pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(msg => this.processPublicConfigurationNotificationMessage(msg));
    interval(1000).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => this.processTimerTick());
  }

  async onSignIn(): Promise<void> {
    this.signInInitiated = true;
    this.subscribeToSubjects();
    this.signals.showAuthFailed.set(false);
    const formValue = this.formGroup.value;
    const authRequestMsg = createAuthRequestMessage();
    authRequestMsg.body.username = formValue.username!;
    authRequestMsg.body.passwordHash = await this.hashSvc.getSha512(formValue.password!);
    this.internalSubjectsSvc.setSignInRequested(authRequestMsg);
  }

  subscribeToSubjects(): void {
    this.messageTransportSvc.getMessageReceivedObservable().pipe(
      filter(msg => msg.header.type === MessageType.authReply),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(msg => this.processAuthReplyMessage(msg as AuthReplyMessage));
  }

  processTimerTick(): void {
    this.processAuthenticationTimeoutCalc();
  }

  processIsConnectedInfo(isConnectedInfo: IsConnectedInfo): void {
    if (!isConnectedInfo.isConnected) {
      this.lastConnectedAt = null;
      this.signals.publicConfigurationNotificationMessage.set(null);
    } else {
      this.lastConnectedAt = isConnectedInfo.lastConnectedAt;
    }
  }

  private processAuthenticationTimeoutCalc(): void {
    if (!this.lastConnectedAt) {
      this.signals.remainingAuthenticationSeconds.set(null);
      this.signals.remainingAuthenticationPercent.set(null);
      return;
    }
    if (!this.signals.publicConfigurationNotificationMessage()) {
      return;
    }

    const authTimeout = this.signals.publicConfigurationNotificationMessage()!.body.authenticationTimeoutSeconds * 1000;
    const diff = Date.now() - this.lastConnectedAt;
    if (diff < authTimeout) {
      let remainingSeconds = Math.ceil((authTimeout - diff) / 1000);
      if (remainingSeconds < 0) {
        remainingSeconds = 0;
      }
      let remainingPercent = Math.ceil(100 - (diff / authTimeout) * 100);
      if (remainingPercent < 0) {
        remainingPercent = 0;
      }
      if (remainingPercent > 100) {
        remainingPercent = 100;
      }
      this.signals.remainingAuthenticationSeconds.set(remainingSeconds);
      this.signals.remainingAuthenticationPercent.set(remainingPercent);
    }
  }

  processPublicConfigurationNotificationMessage(msg: PublicConfigurationNotificationMessage): void {
    this.signals.publicConfigurationNotificationMessage.set(msg);
    this.signals.remainingAuthenticationSeconds.set(null);
    this.processAuthenticationTimeoutCalc();
    const featureCodeSignInEnabled = msg.body.featureFlags.codeSignIn;
    this.signals.qrCodeSignInEnabled.set(featureCodeSignInEnabled);
    this.signals.createSignInCodeReplyMessage.set(null);
    if (featureCodeSignInEnabled) {
      const createCodeReqMsg = createCreateSignInCodeRequestMessage();
      this.messageTransportSvc.sendAndAwaitForReply<CreateSignInCodeRequestMessageBody>(createCodeReqMsg)
        .subscribe(msg => this.processCreateSignInCodeReplyMessage(msg as CreateSignInCodeReplyMessage));
    }
  }

  async processCreateSignInCodeReplyMessage(msg: CreateSignInCodeReplyMessage): Promise<void> {
    if (msg.header.failure) {
      return;
    }
    this.signals.createSignInCodeReplyMessage.set(msg);
    this.showQrCode(msg.body.url);
  }

  async showQrCode(text: string): Promise<void> {
    setTimeout(async () => {
      const canvasEl = document.querySelector('#qrcode-canvas') as HTMLCanvasElement;
      if (canvasEl) {
        await QRCode.toCanvas(canvasEl, text, { scale: 5 });
      }
    });
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

  createSignals(): Signals {
    const signals: Signals = {
      showAuthFailed: signal(false),
      isConnectedInfo: toSignal(this.internalSubjectsSvc.getConnected()),
      qrCodeSignInEnabled: signal(false),
      createSignInCodeReplyMessage: signal(null),
      publicConfigurationNotificationMessage: signal(null),
      remainingAuthenticationSeconds: signal(null),
      remainingAuthenticationPercent: signal(null),
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
  isConnectedInfo: Signal<IsConnectedInfo | undefined>;
  qrCodeSignInEnabled: WritableSignal<boolean>;
  createSignInCodeReplyMessage: WritableSignal<CreateSignInCodeReplyMessage | null>;
  remainingAuthenticationSeconds: WritableSignal<number | null>;
  remainingAuthenticationPercent: WritableSignal<number | null>;
  publicConfigurationNotificationMessage: WritableSignal<PublicConfigurationNotificationMessage | null>;
}
