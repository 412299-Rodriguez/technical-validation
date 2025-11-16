/**
 * Sidebar navigation component.
 * Displays company branding and navigation links on the left side.
 * Responsive - hidden on mobile, visible on medium+ screens.
 */
import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../models/branding.model';

/**
 * Interface representing a navigation link in the sidebar.
 */
export interface SidebarLink {
  /** Display label for the link */
  label: string;
  /** Router path */
  path: string;
  /** SVG icon markup */
  icon: string;
  /** Whether this link is currently active */
  active?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private _branding: CompanyBranding = DEFAULT_COMPANY_BRANDING;
  safeLogoIcon: SafeHtml = this.sanitizeLogo(DEFAULT_COMPANY_BRANDING.logoIcon);

  /** Company branding information */
  @Input()
  set branding(value: CompanyBranding) {
    this._branding = value ?? DEFAULT_COMPANY_BRANDING;
    this.safeLogoIcon = this.sanitizeLogo(this._branding.logoIcon);
  }
  get branding(): CompanyBranding {
    return this._branding;
  }

  /** Navigation links to display in the sidebar */
  @Input() links: SidebarLink[] = [];

  private sanitizeLogo(svgMarkup: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(svgMarkup);
  }
}
