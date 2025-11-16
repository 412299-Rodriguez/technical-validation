import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ClientsListComponent } from './clients-list/clients-list.component';
import { PersonResponse } from '../../shared/models/person.model';
import { NavbarComponent, NavbarUser } from '../../shared/components/navbar/navbar.component';
import { SidebarComponent, SidebarLink } from '../../shared/components/sidebar/sidebar.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../shared/models/branding.model';

/**
 * Page-level container that wires navbar, sidebar and the clients list view.
 * Provides mocked data and layout structure for the Clients section.
 */
@Component({
  standalone: true,
  selector: 'app-clients-page',
  imports: [CommonModule, NavbarComponent, SidebarComponent, ClientsListComponent],
  templateUrl: './clients-page.component.html',
  styleUrls: ['./clients-page.component.css']
})
export class ClientsPageComponent {
  /** Company branding shared with navbar/sidebar. */
  readonly sidebarBranding: CompanyBranding = DEFAULT_COMPANY_BRANDING;

  /** User details shown in the navbar menu. */
  readonly currentUser: NavbarUser = {
    name: 'Juan Perez',
    initials: 'JP'
  };

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

  /** Mocked clients dataset until the API is wired. */
  readonly clients: PersonResponse[] = [
    {
      id: 1,
      fullName: 'María García López',
      identification: '12345678-A',
      age: 34,
      gender: 'FEMALE',
      active: true,
      drives: true,
      wearsGlasses: false,
      diabetic: false,
      otherDisease: null,
      additionalAttributes: []
    },
    {
      id: 2,
      fullName: 'Carlos Rodríguez Martín',
      identification: '87654321-B',
      age: 45,
      gender: 'MALE',
      active: true,
      drives: true,
      wearsGlasses: true,
      diabetic: true,
      otherDisease: 'Hypertension',
      additionalAttributes: []
    },
    {
      id: 3,
      fullName: 'Ana Fernández Pérez',
      identification: '11223344-C',
      age: 28,
      gender: 'FEMALE',
      active: false,
      drives: false,
      wearsGlasses: true,
      diabetic: false,
      otherDisease: null,
      additionalAttributes: []
    },
    {
      id: 4,
      fullName: 'Jorge Sánchez Ruiz',
      identification: '55667788-D',
      age: 52,
      gender: 'MALE',
      active: true,
      drives: true,
      wearsGlasses: false,
      diabetic: false,
      otherDisease: null,
      additionalAttributes: []
    },
    {
      id: 5,
      fullName: 'Laura Martínez Silva',
      identification: '99887766-E',
      age: 39,
      gender: 'FEMALE',
      active: true,
      drives: false,
      wearsGlasses: true,
      diabetic: false,
      otherDisease: null,
      additionalAttributes: []
    }
  ];
}
