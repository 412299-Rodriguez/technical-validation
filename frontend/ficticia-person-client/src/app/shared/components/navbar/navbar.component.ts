/**
 * Top navigation bar component.
 * Displays company branding and user menu.
 * Designed to work across the entire application.
 */
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../models/branding.model';

/**
 * Interface representing the current logged-in user.
 */
export interface NavbarUser {
  /** User's full name */
  name: string;
  /** User's initials for avatar display */
  initials: string;
}

@Component({
  standalone: true,
  selector: 'app-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  /** Sanitizer instance used to trust inline SVG icons. */
  private readonly sanitizer = inject(DomSanitizer);
  /** Branding currently applied to the navbar. */
  private _branding: CompanyBranding = DEFAULT_COMPANY_BRANDING;

  /** Current user information to display in the navbar */
  @Input() currentUser: NavbarUser = { name: 'User', initials: 'U' };
  /** Company branding shown on the left side of the navbar */
  @Input()
  set branding(value: CompanyBranding) {
    this._branding = value ?? DEFAULT_COMPANY_BRANDING;
    this.safeLogoIcon = this.sanitizeLogo(this._branding.logoIcon);
  }
  get branding(): CompanyBranding {
    return this._branding;
  }
  /** Sanitized company logo rendered on the navbar. */
  safeLogoIcon: SafeHtml = this.sanitizeLogo(DEFAULT_COMPANY_BRANDING.logoIcon);
  
  /** Event emitted when user clicks logout */
  @Output() logout = new EventEmitter<void>();

  /** Controls the visibility of the user dropdown menu */
  userMenuOpen = false;

  /**
   * Toggles the user dropdown menu visibility.
   */
  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  /**
   * Handles logout button click.
   * Emits logout event to parent component.
   */
  onLogout(): void {
    this.userMenuOpen = false;
    this.logout.emit();
  }

  /**
   * Marks an inline SVG string as safe so Angular can project it without stripping nodes.
   */
  private sanitizeLogo(svgMarkup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgMarkup);
  }
}
