package com.ficticia.ficticia_client_service.application.validators;

import java.util.regex.Pattern;

/**
 * Reusable password policy definition to ensure consistent validation rules.
 *
 * <p>The current policy requires:</p>
 * <ul>
 *   <li>At least eight characters.</li>
 *   <li>At least two digits.</li>
 *   <li>At least one special (non alphanumeric) character.</li>
 * </ul>
 */
public final class PasswordPolicy {

    /**
     * Regular expression that enforces two digits, one special character and minimum length of eight characters.
     */
    public static final String REGEX = "^(?=(?:.*\\d){2,})(?=.*[^A-Za-z0-9]).{8,}$";

    /**
     * Human-readable validation message, reused across annotations and programmatic checks.
     */
    public static final String MESSAGE = "Password must include at least eight characters, two digits and one special character.";

    private static final Pattern COMPILED_PATTERN = Pattern.compile(REGEX);

    private PasswordPolicy() {
        // Utility class
    }

    /**
     * Programmatically validates the provided password against the policy.
     *
     * @param value password to evaluate
     * @return {@code true} if the password satisfies the policy
     */
    public static boolean isValid(final String value) {
        return value != null && COMPILED_PATTERN.matcher(value).matches();
    }
}
