/**
 * Login screen component that renders the reactive form and handles submit UX state.
 */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormFieldErrorComponent } from '../../../shared/components/form-field-error/form-field-error.component';
import { AuthService } from '../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FeedbackPanelComponent } from '../../../shared/components/feedback-panel/feedback-panel.component';

type LoginForm = FormGroup<{
  username: FormControl<string>;
  password: FormControl<string>;
}>;

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FormFieldErrorComponent, FeedbackPanelComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  /** Reactive form that captures the login credentials. */
  readonly form: LoginForm;

  isSubmitting = false;
  feedbackState = signal<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
  } | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.nonNullable.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Handles the submit event and calls the real authentication API. */
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.feedbackState.set(null);

    this.authService
      .login(this.form.getRawValue())
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: (error: HttpErrorResponse) => this.handleError(error)
      });
  }

  private handleError(error: HttpErrorResponse): void {
    if (error.status === 400 || error.status === 403) {
      this.feedbackState.set({
        type: 'warning',
        title: 'Credenciales inválidas',
        message: 'Verifica usuario y contraseña e inténtalo de nuevo.'
      });
      this.cdr.detectChanges();
      return;
    }

    if (error.status >= 500) {
      this.feedbackState.set({
        type: 'error',
        title: 'Error del servidor',
        message: 'El servicio no responde en este momento. Intenta nuevamente más tarde.'
      });
      this.cdr.detectChanges();
      return;
    }

    this.feedbackState.set({
      type: 'error',
      title: 'Inicio de sesión fallido',
      message: error.error?.message ?? 'Ocurrió un error inesperado. Intenta otra vez.'
    });
    this.cdr.detectChanges();
  }

  onFeedbackClose(): void {
    this.feedbackState.set(null);
    this.cdr.detectChanges();
  }
}
