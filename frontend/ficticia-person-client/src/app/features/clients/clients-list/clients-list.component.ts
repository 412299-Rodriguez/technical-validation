import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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
   * Placeholder hook for the New Client CTA.
   * In a future iteration this should navigate to the creation form.
   */
  onNewClient(): void {
    console.log('TODO: navigate to client creation page');
  }
}
