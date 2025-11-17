import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const PASSWORD_POLICY_REGEX = /^(?=(?:.*\d){2,})(?=.*[^A-Za-z0-9]).{8,}$/;

/** Human-readable description of the enforced password strength rule. */
export const PASSWORD_POLICY_MESSAGE =
  'La contraseña debe tener al menos 8 caracteres, incluyendo al menos 2 dígitos y 1 carácter especial.';

/**
 * Validator factory that checks whether the control value satisfies the password policy.
 *
 * The validator purposely ignores empty values to let `Validators.required` be responsible for emptiness.
 */
export function passwordStrengthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }
    return PASSWORD_POLICY_REGEX.test(value) ? null : { passwordStrength: true };
  };
}

/**
 * Convenience helper used in components to perform imperative checks (e.g. disable buttons).
 */
export function isPasswordStrong(value: string | null | undefined): boolean {
  if (!value) {
    return false;
  }
  return PASSWORD_POLICY_REGEX.test(value);
}
