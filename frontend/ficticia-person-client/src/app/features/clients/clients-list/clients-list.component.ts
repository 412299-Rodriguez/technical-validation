import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
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

  /** Free text filter applied to name or identification. */
  searchTerm = '';

  /** Current status filter. */
  statusFilter: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';

  /**
   * Returns the dataset filtered by the search term and the status selector.
   */
  get filteredClients(): PersonResponse[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    return this.clients.filter((client) => {
      const matchesSearch =
        normalizedTerm.length === 0 ||
        client.fullName.toLowerCase().includes(normalizedTerm) ||
        client.identification.toLowerCase().includes(normalizedTerm);

      const matchesStatus =
        this.statusFilter === 'ALL' ||
        (this.statusFilter === 'ACTIVE' && client.active) ||
        (this.statusFilter === 'INACTIVE' && !client.active);

      return matchesSearch && matchesStatus;
    });
  }

  /**
   * Raises the output so parents can open the modal.
   */
  onNewClient(): void {
    this.newClient.emit();
  }
}
