import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';
import { AuthService } from '../../../core/services/auth.service';
import { FeedbackPanelComponent } from '../../../shared/components/feedback-panel/feedback-panel.component';
import { HttpErrorResponse } from '@angular/common/http';

type ForgotPasswordForm = FormGroup<{
  email: FormControl<string>;
}>;

interface FeedbackState {
  type: 'success' | 'warning' | 'error';
  title: string;
  message: string;
  primaryLabel: string;
}

/**
 * Minimalistic page that allows employees to request a password reset link.
 */
@Component({
  standalone: true,
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent, FeedbackPanelComponent]
})
export class ForgotPasswordComponent {
  readonly form: ForgotPasswordForm;

  readonly feedbackState = signal<FeedbackState | null>(null);
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    this.authService.requestPasswordReset(this.form.getRawValue()).subscribe({
      next: () => this.showSuccess(),
      error: (error: HttpErrorResponse) => this.showError(error),
      complete: () => {
        this.isSubmitting = false;
        this.cdr.markForCheck();
      }
    });
  }

  onFeedbackPrimary(): void {
    this.feedbackState.set(null);
    this.form.reset();
    this.cdr.markForCheck();
  }

  private showSuccess(): void {
    this.feedbackState.set({
      type: 'success',
      title: '!Mail enviado!',
      message: "Te hemos enviado un correo electrónico con instrucciones para restablecer tu contraseña.",
      primaryLabel: 'Continuar'
    });
    this.cdr.markForCheck();
  }

  private showError(error: HttpErrorResponse): void {
    const message = error.error?.message ?? 'Imposible enviar el correo electrónico. Por favor, inténtalo de nuevo más tarde.';
    this.feedbackState.set({
      type: 'error',
      title: 'Restablecimiento de contraseña fallido',
      message,
      primaryLabel: 'Cerrar'
    });
    this.cdr.markForCheck();
  }

  goBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}
