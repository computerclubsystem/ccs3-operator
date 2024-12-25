import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';
import { Observable } from 'rxjs';

import { ConnectorService } from '../connector/connector.service';
import { Message } from '../messages/declarations/message';
import { MessageType } from '../messages/declarations/message-type';
import { createAuthRequestMessage } from '../messages/auth-request.message';
import { SubjectsService } from '../shared/subjects.service';
import { WebAppConfig } from '../shared/web-app-config';

@Component({
    imports: [ReactiveFormsModule, AsyncPipe, MatInputModule, MatButtonModule, TranslocoDirective],
    templateUrl: './sign-in.component.html'
})
export class SignInComponent implements OnInit {
  formGroup!: FormGroup<SignInFormControls>;
  webAppConfig$?: Observable<WebAppConfig>;

  private destroyRef = inject(DestroyRef);

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly connectorSvc: ConnectorService,
    private readonly subjectsSvc: SubjectsService,
  ) { }

  ngOnInit(): void {
    this.formGroup = this.createForm();
    this.subscribeToSubjects();
  }

  onSignIn(): void {
    const formValue = this.formGroup.value;
    const msg = createAuthRequestMessage();
    msg.body.username = formValue.username!;
    msg.body.passwordHash = formValue.password!;
    //     const msg: Message<any> = {
    //       header: { type: MessageType.authRequest },
    // body: {

    // }
    //     };
    this.connectorSvc.sendMessage(msg);
  }

  createForm(): FormGroup {
    const formGroup = this.formBuilder.group<SignInFormControls>({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required),
    });
    return formGroup;
  }

  private subscribeToSubjects(): void {
    this.webAppConfig$ = this.subjectsSvc.getWebAppConfigObservable().pipe(
      takeUntilDestroyed(this.destroyRef),
    );
  }
}

interface SignInFormControls {
  username: FormControl<string | null>;
  password: FormControl<string | null>;
}
