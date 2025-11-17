import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PersonResponse } from '../../../shared/models/person.model';

/**
 * Renders the searchable and filterable list of clients.
 * Handles the table, filters and "new client" action placeholder.
 */
@Component({
  standalone: true,
  selector: 'app-clients-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './clients-list.component.html',
  styleUrls: ['./clients-list.component.css']
})
export class ClientsListComponent {
  /** Incoming client dataset supplied by the page container. */
  @Input() clients: PersonResponse[] = [];
  /** Notifies parent components that the New Client CTA was selected. */
  @Output() newClient = new EventEmitter<void>();
  /** Notifies parent components to edit an existing client. */
  @Output() editClient = new EventEmitter<PersonResponse>();
  /** Notifies parent components to delete an existing client. */
  @Output() deleteClient = new EventEmitter<PersonResponse>();

  /** Free text filter applied to name or identification. */
  searchTerm = '';

  /** Current status filter. */
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  /** Current sort direction applied to the ID column (newest vs oldest). */
  sortDirection: 'asc' | 'desc' = 'desc';
  /** Tracks which action-menu is expanded. */
  openActionsForId: number | null = null;

  /**
   * Returns the dataset filtered by the search term and the status selector.
   */
  get filteredClients(): PersonResponse[] {
    const normalizedTerm = this.normalizeText(this.searchTerm);

    const filtered = this.clients.filter((client) => {
      const normalizedFullName = this.normalizeText(client.fullName);
      const normalizedIdentification = this.normalizeText(client.identification);

      const matchesSearch =
        normalizedTerm.length === 0 ||
        normalizedFullName.includes(normalizedTerm) ||
        normalizedIdentification.includes(normalizedTerm);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && client.active) ||
        (this.statusFilter === 'INACTIVE' && !client.active);

      return matchesSearch && matchesStatus;
    });

    return filtered.slice().sort((a, b) => {
      const aId = Number(a.id) || 0;
      const bId = Number(b.id) || 0;
      return this.sortDirection === 'desc' ? bId - aId : aId - bId;
    });
  }

  /**
   * Raises the output so parents can open the modal.
   */
  onNewClient(): void {
    this.newClient.emit();
  }

  /**
   * Emits the selected client so the parent can open the edit modal.
   */
  onEditClient(client: PersonResponse): void {
    this.openActionsForId = null;
    this.editClient.emit(client);
  }

  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
  }

  /**
   * Normalizes diacritics and casing so text comparisons are accent/case insensitive.
   */
  private normalizeText(value?: string | null): string {
    return (value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  onDeleteClient(client: PersonResponse): void {
    this.openActionsForId = null;
    this.deleteClient.emit(client);
  }

  toggleActionsMenu(id: number, event: Event): void {
    event.stopPropagation();
    this.openActionsForId = this.openActionsForId === id ? null : id;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openActionsForId = null;
  }
}
