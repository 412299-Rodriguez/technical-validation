import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FeedbackPanelComponent } from '../../../shared/components/feedback-panel/feedback-panel.component';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';
import { PASSWORD_POLICY_MESSAGE, passwordStrengthValidator } from '../../../shared/validators/password-strength.validator';
import { HttpErrorResponse } from '@angular/common/http';

type ResetPasswordForm = FormGroup<{
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

/**
 * Component responsible for exchanging a reset token for a new password.
 */
@Component({
  standalone: true,
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FeedbackPanelComponent, FormFieldErrorComponent]
})
export class ResetPasswordComponent {
  readonly form: ResetPasswordForm;
  readonly passwordErrorMessages = {
    passwordStrength: PASSWORD_POLICY_MESSAGE,
    minlength: 'La contraseña debe tener al menos 8 caracteres.',
  };
  readonly confirmPasswordErrorMessages = {
    ...this.passwordErrorMessages,
    passwordMismatch: 'Las contraseñas no coinciden.'
  };

  readonly feedbackState = signal<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    primaryLabel: string;
  } | null>(null);

  private readonly token: string | null;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]],
      confirmPassword: ['', [Validators.required, Validators.minLength(8), passwordStrengthValidator()]]
    });
    this.token = this.route.snapshot.queryParamMap.get('token');
    if (!this.token) {
      this.feedbackState.set({
        type: 'error',
        title: 'Link inválido',
        message: 'El link de restablecimiento de contraseña no es válido o ha expirado. Solicite un nuevo enlace para continuar.',
        primaryLabel: 'Volver al inicio de sesión'
      });
      this.form.disable();
    }
  }

  onSubmit(): void {
    if (!this.token) {
      return;
    }
    const passwordsValid = this.ensurePasswordsMatch();
    if (this.form.invalid || !passwordsValid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSubmitting = true;
    const payload = {
      token: this.token,
      ...this.form.getRawValue()
    };
    this.authService.resetPassword(payload).subscribe({
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
    this.router.navigate(['/auth/login']);
  }

  private ensurePasswordsMatch(): boolean {
    const password = this.form.controls.password.value;
    const confirm = this.form.controls.confirmPassword.value;
    if (password !== confirm) {
      const currentErrors = this.form.controls.confirmPassword.errors ?? {};
      this.form.controls.confirmPassword.setErrors({ ...currentErrors, passwordMismatch: true });
      return false;
    }
    if (this.form.controls.confirmPassword.errors?.['passwordMismatch']) {
      const { passwordMismatch, ...rest } = this.form.controls.confirmPassword.errors;
      this.form.controls.confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
    }
    return true;
  }

  private showSuccess(): void {
    this.feedbackState.set({
      type: 'success',
      title: 'Contraseña restablecida',
      message: 'Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
      primaryLabel: 'Volver al inicio de sesión'
    });
    this.cdr.markForCheck();
  }

  private showError(error: HttpErrorResponse): void {
    const message = error.error?.message ?? 'No se pudo restablecer la contraseña. Por favor, intenta nuevamente más tarde.';
    this.feedbackState.set({
      type: 'error',
      title: 'Restablecimiento fallido',
      message,
      primaryLabel: 'Cerrar'
    });
    this.cdr.markForCheck();
  }
}
