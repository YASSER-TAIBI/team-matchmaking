import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule
  ],
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  infoMessage = '';
  errorMessage: Array<string> = [];
  isSubmitting = false;

  submit(): void {
    this.errorMessage = [];
    this.infoMessage = '';

    if (!this.email) {
      this.errorMessage.push('Email est requis');
      return;
    }

    this.isSubmitting = true;
    this.authService.requestPasswordReset({ email: this.email }).subscribe({
      next: () => {
        this.infoMessage = 'Si un compte existe pour cet email, un lien de réinitialisation vous a été envoyé.';
        this.isSubmitting = false;
      },
      error: (err: any) => {
        const backendError = err.error;
        if (backendError?.errorMessage) {
          this.errorMessage.push(backendError.errorMessage);
        } else {
          this.errorMessage.push('Une erreur est survenue.');
        }
        this.isSubmitting = false;
      }
    });
  }

  backToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
