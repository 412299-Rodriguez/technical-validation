import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { SidebarComponent, SidebarLink } from '../../shared/components/sidebar/sidebar.component';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { NewClientFormComponent } from './new-client-form/new-client-form.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../shared/models/branding.model';
import { PersonResponse } from '../../shared/models/person.model';
import { PersonService } from '../../core/services/person.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Page-level container that wires navbar, sidebar and the clients list view.
 * Fetches the real client dataset before rendering the list.
 */
@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, SidebarComponent, ClientsListComponent, ModalComponent, NewClientFormComponent],
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.css']
})
export class ClientsPageComponent implements OnInit, OnDestroy {
  /** Company branding shared with navbar/sidebar. */
  readonly sidebarBranding: CompanyBranding = DEFAULT_COMPANY_BRANDING;

  /** Sidebar navigation options, highlighting the current section. */
  readonly sidebarLinks: SidebarLink[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </svg>`
    },
    {
      label: 'Clients',
      path: '/clients',
      active: true,
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`
    }
  ];

  /** Clients fetched from the backend. */
  readonly clients = signal<PersonResponse[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly loadError = signal<string>('');

  /** Controls whether the New Client modal is visible. */
  isNewClientModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  selectedClient: PersonResponse | null = null;

  private readonly personService = inject(PersonService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.enableBodyScroll();
    this.loadClients();
  }

  ngOnDestroy(): void {
    this.restoreBodyScroll();
  }

  private loadClients(): void {
    this.isLoading.set(true);
    this.loadError.set('');

    this.personService
      .getPersons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (clients) => {
          this.clients.set(Array.isArray(clients) ? clients : []);
          this.isLoading.set(false);
        },
        error: (error) => {
          console.error('Failed to load clients', error);
          this.clients.set([]);
          this.isLoading.set(false);
          this.loadError.set('No pudimos obtener la lista de clientes. Intenta nuevamente.');
        }
      });
  }

  private enableBodyScroll(): void {
    const htmlElement = this.document.documentElement;
    htmlElement.style.overflow = 'auto';
    this.document.body.style.overflow = 'auto';
  }

  private restoreBodyScroll(): void {
    const htmlElement = this.document.documentElement;
    htmlElement.style.overflow = '';
    this.document.body.style.overflow = '';
  }

  openCreateModal(): void {
    this.modalMode = 'create';
    this.selectedClient = null;
    this.isNewClientModalOpen = true;
  }

  openEditModal(client: PersonResponse): void {
    this.modalMode = 'edit';
    this.selectedClient = client;
    this.isNewClientModalOpen = true;
  }

  handleFormClose(): void {
    this.isNewClientModalOpen = false;
  }

  handleFormSubmit(payload: PersonResponse): void {
    console.log('Client form submission payload', payload);
    this.isNewClientModalOpen = false;
  }
}
