import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  readonly form = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
  });

  selectedAuthTab: 'login' | 'register' = 'login';

  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    iconRegistry.addSvgIconLiteral(
      'google',
      sanitizer.bypassSecurityTrustHtml(
        '<svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.654 32.657 29.188 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 16.108 19.02 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.193l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.166 0-9.61-3.319-11.16-7.946l-6.522 5.025C9.637 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.011 2.853-3.038 5.253-5.784 6.569l.003-.002 6.19 5.238C35.273 40.205 44 34 44 24c0-1.341-.138-2.651-.389-3.917z"/></svg>'
      )
    );

    iconRegistry.addSvgIconLiteral(
      'apple',
      sanitizer.bypassSecurityTrustHtml(
        '<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16.365 1.43c0 1.14-.424 2.188-1.214 3.047-.808.879-2.143 1.557-3.343 1.462-.156-1.116.46-2.268 1.217-3.08.835-.88 2.279-1.51 3.34-1.429ZM20.5 17.05c-.566 1.307-.838 1.889-1.566 3.05-1.017 1.613-2.45 3.625-4.236 3.64-1.586.016-1.993-1.034-4.146-1.02-2.154.013-2.6 1.04-4.187 1.025-1.786-.016-3.149-1.83-4.166-3.442-2.84-4.5-3.14-9.786-1.386-12.478 1.244-1.91 3.21-3.033 5.06-3.033 1.885 0 3.07 1.04 4.627 1.04 1.513 0 2.433-1.043 4.61-1.043 1.651 0 3.401.9 4.642 2.458-4.063 2.226-3.407 8.03.748 9.803Z"/></svg>'
      )
    );
  }
}
