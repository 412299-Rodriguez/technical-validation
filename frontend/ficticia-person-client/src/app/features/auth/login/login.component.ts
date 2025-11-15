/**
 * Login screen component that renders the reactive form and handles submit UX state.
 */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';

type LoginForm = FormGroup<{
  email: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormFieldErrorComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /** Reactive form that captures the login credentials. */
  readonly form: LoginForm;

  isSubmitting = false;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Handles the submit intent and simulates async processing. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      // TODO: conectar con AuthService y API de login
      this.isSubmitting = false;
    }, 1000);
  }
}
