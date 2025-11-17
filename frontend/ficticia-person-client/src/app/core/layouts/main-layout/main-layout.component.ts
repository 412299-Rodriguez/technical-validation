/**
 * Layout wrapper for authenticated pages, rendering the navbar plus nested routes.
 */
import { Component, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent, NavbarUser } from '../../../shared/components/navbar/navbar.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../../shared/models/branding.model';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnDestroy {
  readonly branding: CompanyBranding = DEFAULT_COMPANY_BRANDING;
  currentUser: NavbarUser = {
    name: 'User',
    initials: 'U'
  };

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly sessionSubscription: Subscription;

  constructor() {
    this.updateCurrentUser(this.authService.sessionSnapshot?.user?.name ?? null);
    this.sessionSubscription = this.authService.sessionChanges().subscribe((session) => {
      this.updateCurrentUser(session?.user?.name ?? null);
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  ngOnDestroy(): void {
    this.sessionSubscription.unsubscribe();
  }

  private updateCurrentUser(name: string | null): void {
    if (!name) {
      this.currentUser = { name: 'User', initials: 'U' };
      return;
    }
    this.currentUser = {
      name,
      initials: this.computeInitials(name)
    };
  }

  private computeInitials(name: string): string {
    return (
      name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((chunk) => chunk.charAt(0).toUpperCase())
        .join('') || 'U'
    );
  }
}
