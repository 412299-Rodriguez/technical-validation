export interface CompanyBranding {
  /**
   * Company display name.
   */
  name: string;
  /**
   * Optional subtitle/tagline for the company.
   */
  subtitle?: string;
  /**
   * Inline SVG markup for the company icon.
   */
  logoIcon: string;
}

export const DEFAULT_COMPANY_BRANDING: CompanyBranding = {
  name: 'Ficticia S.A.',
  subtitle: 'Insurance Management',
  logoIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
  </svg>`
};
