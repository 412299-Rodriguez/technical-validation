import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Generic overlay modal used to project arbitrary content in a centered dialog.
 */
@Component({
  standalone: true,
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  /** Dialog title rendered in the header. */
  @Input() title = '';
  /** Controls whether the modal is visible. */
  @Input() visible = false;
  /** Emitted whenever the user dismisses the modal. */
  @Output() closed = new EventEmitter<void>();

  /**
   * Emits the closed event so parent components can hide the modal.
   */
  onClose(): void {
    this.closed.emit();
  }
}
