import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { FeedbackPanelComponent } from '../../../shared/components/feedback-panel/feedback-panel.component';

type RegisterForm = FormGroup<{
  fullName: FormControl<string>;
  employeeId: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}>;

/**
 * Standalone registration page that collects employee onboarding information.
 */
@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    FormFieldErrorComponent,
    FeedbackPanelComponent
  ]
})
export class RegisterComponent {
  /** Reactive form capturing the registration details. */
  readonly form: RegisterForm;

  submitting = false;
  feedbackState: {
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    primaryLabel: string;
    secondaryLabel?: string;
  } | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.buildForm();
  }

  /** Builds the registration form and wires synchronous validators. */
  private buildForm(): RegisterForm {
    return this.fb.nonNullable.group({
      fullName: ['', [Validators.required, Validators.maxLength(150)]],
      employeeId: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  get fullName() {
    return this.form.controls.fullName;
  }

  get employeeId() {
    return this.form.controls.employeeId;
  }

  get email() {
    return this.form.controls.email;
  }

  get password() {
    return this.form.controls.password;
  }

  get confirmPassword() {
    return this.form.controls.confirmPassword;
  }

  /** Handles the submit intent and will later reach the backend API. */
  onSubmit(): void {
    const passwordsValid = this.ensurePasswordsMatch();

    if (this.form.invalid || !passwordsValid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.getRawValue();

    this.authService
      .register(payload)
      .pipe(
        finalize(() => {
          this.submitting = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (response) => {
          this.feedbackState = {
            type: 'success',
            title: 'Registro exitoso',
            message: `Cuenta ${response.username} creada. Ahora puedes logearte!`,
            primaryLabel: 'Ir al login'
          };
          this.cdr.markForCheck();
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 403) {
            this.feedbackState = {
              type: 'warning',
              title: 'Account registration issue',
              message: 'Porfavor revisa el formulario o contacta con soporte.',
              primaryLabel: 'Revisar formulario',
              secondaryLabel: 'Contactar soporte'
            };
          } else {
            const message = error.error?.message ?? 'Ha ocurrido un error inesperado. Porfavor intenta de nuevo más tarde.';
            this.feedbackState = {
              type: 'error',
              title: 'Registro fallido',
              message,
              primaryLabel: 'Intentar de nuevo'
            };
          }
          this.cdr.markForCheck();
        }
      });
  }

  private ensurePasswordsMatch(): boolean {
    const password = this.password.value;
    const confirm = this.confirmPassword.value;

    if (password !== confirm) {
      const currentErrors = this.confirmPassword.errors ?? {};
      this.confirmPassword.setErrors({ ...currentErrors, passwordMismatch: true });
      return false;
    }

    if (this.confirmPassword.errors?.['passwordMismatch']) {
      const { passwordMismatch, ...rest } = this.confirmPassword.errors;
      this.confirmPassword.setErrors(Object.keys(rest).length ? rest : null);
    }

    return true;
  }

  onFeedbackPrimaryAction(): void {
    if (!this.feedbackState) {
      return;
    }
    if (this.feedbackState.type === 'success') {
      this.router.navigate(['/auth/login']);
      this.feedbackState = null;
    } else {
      this.feedbackState = null;
    }
    this.cdr.markForCheck();
  }

  onFeedbackSecondaryAction(): void {
    if (!this.feedbackState) {
      return;
    }
    this.feedbackState = null;
    this.cdr.markForCheck();
  }
}
