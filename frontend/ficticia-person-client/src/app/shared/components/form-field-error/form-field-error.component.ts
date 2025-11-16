/**
 * Presentational helper that renders validation feedback for form controls.
 */
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-form-field-error',
  imports: [CommonModule],
  templateUrl: './form-field-error.component.html'
})
export class FormFieldErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() customMessages: Record<string, string> = {};

  /** Whether the message should be visible (invalid + touched/dirty). */
  get shouldShowError(): boolean {
    return !!this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  /** Picks the highest-priority validation error message to display. */
  get message(): string | null {
    if (!this.control) {
      return null;
    }

    const errors = this.control.errors;
    if (!errors) {
      return null;
    }

    const firstKey = Object.keys(errors)[0];
    if (!firstKey) {
      return null;
    }

    if (this.customMessages[firstKey]) {
      return this.customMessages[firstKey];
    }

    return this.resolveDefaultMessage(firstKey, errors);
  }

  /** Provides a human-readable fallback message per error key. */
  private resolveDefaultMessage(key: string, errors: ValidationErrors): string {
    switch (key) {
      case 'required':
        return 'El campo es obligatorio';
      case 'email':
        return 'Ingrese un correo electrónico válido';
      case 'minlength':
        return `Debe tener al menos ${(errors['minlength'] as { requiredLength: number }).requiredLength} caracteres`;
      default:
        return 'Campo inválido';
    }
  }
}
