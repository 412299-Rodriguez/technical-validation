/**
 * Layout wrapper for authenticated pages, rendering the navbar plus nested routes.
 */
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent, NavbarUser } from '../../../shared/components/navbar/navbar.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../../shared/models/branding.model';
import { AuthService } from '../../services/auth.service';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  readonly branding: CompanyBranding = DEFAULT_COMPANY_BRANDING;
  readonly currentUser: NavbarUser = {
    name: 'Juan Perez',
    initials: 'JP'
  };

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
