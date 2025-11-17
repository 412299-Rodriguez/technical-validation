import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';

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
    FormFieldErrorComponent
  ]
})
export class RegisterComponent {
  /** Reactive form capturing the registration details. */
  readonly form: RegisterForm;

  submitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(private readonly fb: FormBuilder, private readonly authService: AuthService, private readonly router: Router) {
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
    this.errorMessage = '';
    this.successMessage = '';
    const payload = this.form.getRawValue();

    this.authService
      .register(payload)
      .pipe(finalize(() => (this.submitting = false)))
      .subscribe({
        next: () => {
          this.successMessage = 'Account created! You can log in now.';
          setTimeout(() => this.router.navigate(['/auth/login']), 1200);
        },
        error: () => {
          this.errorMessage = 'Unable to register. Please check your data and try again.';
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
}
