import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-reset-password',
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
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {

  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  token = '';
  password = '';
  confirmPassword = '';

  isTokenValid = false;
  isCheckingToken = true;
  isSubmitting = false;

  infoMessage = '';
  errorMessage: Array<string> = [];

  constructor() {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.token) {
      this.isCheckingToken = false;
      this.isTokenValid = false;
      this.errorMessage = ['Token manquant'];
      return;
    }

    this.authService.validatePasswordResetToken(this.token).subscribe({
      next: () => {
        this.isTokenValid = true;
        this.isCheckingToken = false;
      },
      error: (err: any) => {
        const backendError = err.error;
        if (backendError?.errorMessage) {
          this.errorMessage.push(backendError.errorMessage);
        } else {
          this.errorMessage.push('Token invalide ou expiré');
        }
        this.isTokenValid = false;
        this.isCheckingToken = false;
      }
    });
  }

  submit(): void {
    this.errorMessage = [];
    this.infoMessage = '';

    if (!this.isTokenValid) {
      this.errorMessage.push('Token invalide');
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.errorMessage.push('Mot de passe et confirmation requis');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.push('Les mots de passe ne correspondent pas');
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword({
      token: this.token,
      password: this.password,
      confirmPassword: this.confirmPassword
    }).subscribe({
      next: (res) => {
        this.infoMessage = res.body?.message ?? 'Mot de passe mis à jour avec succès';
        this.isSubmitting = false;
        void this.router.navigate(['/login']);
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
