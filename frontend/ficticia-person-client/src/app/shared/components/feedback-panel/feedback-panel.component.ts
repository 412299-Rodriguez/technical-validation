import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Reusable feedback card that communicates success, error or informational states.
 * Can be embedded full screen or inside a modal.
 */
@Component({
  standalone: true,
  selector: 'app-feedback-panel',
  imports: [CommonModule],
  templateUrl: './feedback-panel.component.html',
  styleUrls: ['./feedback-panel.component.css']
})
export class FeedbackPanelComponent {
  /** Visual style of the panel that drives icon and color palette. */
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'success';
  /** Headline shown to the user. */
  @Input() title = 'Action completed';
  /** Short descriptive message shown under the title. */
  @Input() message = 'The operation finished successfully.';
  /** Label for the primary CTA button. */
  @Input() primaryButtonLabel = 'OK';
  /** Optional secondary action label. When provided, a second button is rendered. */
  @Input() secondaryButtonLabel?: string;

  /** Emits when the user clicks the primary CTA button. */
  @Output() primaryAction = new EventEmitter<void>();
  /** Emits when the user clicks the optional secondary button. */
  @Output() secondaryAction = new EventEmitter<void>();

  /**
   * Resolves the background color for the icon container based on the alert type.
   */
  get iconContainerClass(): string {
    const map: Record<typeof this.type, string> = {
      success: 'bg-emerald-50',
      error: 'bg-rose-50',
      warning: 'bg-amber-50',
      info: 'bg-sky-50'
    };
    return map[this.type];
  }

  /**
   * Resolves the icon stroke color.
   */
  get iconColorClass(): string {
    const map: Record<typeof this.type, string> = {
      success: 'text-emerald-600',
      error: 'text-rose-600',
      warning: 'text-amber-600',
      info: 'text-sky-600'
    };
    return map[this.type];
  }

  /**
   * Resolves the title color for better contrast versus the icon palette.
   */
  get titleColorClass(): string {
    const map: Record<typeof this.type, string> = {
      success: 'text-emerald-700',
      error: 'text-rose-700',
      warning: 'text-amber-700',
      info: 'text-sky-700'
    };
    return map[this.type];
  }

  /** Emits the primary action event. */
  onPrimaryClick(): void {
    this.primaryAction.emit();
  }

  /** Emits the optional secondary action event. */
  onSecondaryClick(): void {
    this.secondaryAction.emit();
  }
}

// Usage example:
// <app-feedback-panel
//   type="success"
//   title="Registration Successful!"
//   message="Your account has been created. You can now log in."
//   primaryButtonLabel="Go to Login"
//   (primaryAction)="onGoToLogin()"
// ></app-feedback-panel>

// <app-feedback-panel
//   type="error"
//   title="Something went wrong"
//   message="We could not process your request. Please try again."
//   primaryButtonLabel="Try again"
//   secondaryButtonLabel="Cancel"
//   (primaryAction)="retry()"
//   (secondaryAction)="close()"
// ></app-feedback-panel>
