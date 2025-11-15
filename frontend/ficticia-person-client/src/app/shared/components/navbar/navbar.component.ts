/**
 * Top navigation bar listing the main links for authenticated users.
 */
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NavLink {
  label: string;
  path: string;
}

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  readonly links: NavLink[] = [
    { label: 'Personas', path: '/persons' },
    { label: 'Nueva persona', path: '/persons/new' }
  ];
}
