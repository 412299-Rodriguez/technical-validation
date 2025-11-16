import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, inject, PLATFORM_ID, Inject, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SidebarComponent, SidebarLink } from '../../shared/components/sidebar/sidebar.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../shared/models/branding.model';

// Lazy import Chart.js only in browser
let Chart: any;
let registerables: any;

if (typeof window !== 'undefined') {
  import('chart.js').then(module => {
    Chart = module.Chart;
    registerables = module.registerables;
    Chart.register(...registerables);
  });
}

/**
 * Shape of the metric cards displayed at the top of the dashboard.
 */
interface DashboardMetric {
  id: string;
  label: string;
  value: number;
  subtitle: string;
  accentColorClass: string;
  iconSvg: string;
  safeIconSvg?: SafeHtml;
}

/**
 * Segment definition for the health factors pie chart.
 */
interface HealthFactorSlice {
  label: string;
  value: number;
  color: string;
}

/**
 * Bucket definition for the age distribution bar chart.
 */
interface AgeDistributionBucket {
  label: string;
  value: number;
  color: string;
}

/**
 * Bucket describing how many clients fall into each activity status.
 */
interface UserStatusBucket {
  label: string;
  value: number;
}

/**
 * Represents the split between clients who have a condition and those who do not.
 */
interface ConditionComparisonBucket {
  label: string;
  yes: number;
  no: number;
}

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports: [CommonModule, SidebarComponent]
})
export class HomePageComponent implements AfterViewInit, OnDestroy {
  /** Canvas reference for the pie chart instance. */
  @ViewChild('pieChartCanvas') pieChartCanvas?: ElementRef<HTMLCanvasElement>;
  /** Canvas reference for the bar chart instance. */
  @ViewChild('barChartCanvas') barChartCanvas?: ElementRef<HTMLCanvasElement>;
  /** Canvas reference for the user status chart. */
  @ViewChild('userStatusChartCanvas') userStatusChartCanvas?: ElementRef<HTMLCanvasElement>;
  /** Canvas reference for the condition comparison chart. */
  @ViewChild('comparisonChartCanvas') comparisonChartCanvas?: ElementRef<HTMLCanvasElement>;

  /** Chart.js pie chart reference so it can be destroyed. */
  private pieChart?: any;
  /** Chart.js bar chart reference so it can be destroyed. */
  private barChart?: any;
  /** Chart.js instance for the user status chart. */
  private userStatusChart?: any;
  /** Chart.js instance for the yes vs no comparison chart. */
  private comparisonChart?: any;

  /** Branding shared with the sidebar and navbar components. */
  readonly sidebarBranding: CompanyBranding = DEFAULT_COMPANY_BRANDING;

  /** Sidebar links rendered on the navigation rail. */
  readonly sidebarLinks: SidebarLink[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      active: true,
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
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>`
    }
  ];

  /** Metrics displayed on the summary cards. */
  metrics: DashboardMetric[] = [];

  /** Data series used by the health factors pie chart. */
  readonly healthFactorSlices: HealthFactorSlice[] = [
    { label: 'Maneja', value: 4, color: '#8b5cf6' },
    { label: 'Usa lentes', value: 3, color: '#6366f1' },
    { label: 'Diabetico', value: 1, color: '#ec4899' },
    { label: 'Otra enfermedad', value: 2, color: '#f97316' }
  ];

  /** Data series used by the age distribution bar chart. */
  readonly ageDistribution: AgeDistributionBucket[] = [
    { label: '18-30', value: 1, color: '#60a5fa' },
    { label: '31-40', value: 2, color: '#3b82f6' },
    { label: '41-50', value: 1, color: '#2563eb' },
    { label: '51-60', value: 1, color: '#1d4ed8' }
  ];

  /** Mock dataset representing how many users are active vs inactive. */
  readonly userStatusStats: UserStatusBucket[] = [
    { label: 'Activos', value: 8 },
    { label: 'Inactivos', value: 2 }
  ];

  /** Comparison dataset that splits each condition between yes/no counts. */
  readonly conditionComparison: ConditionComparisonBucket[] = [
    { label: 'Maneja', yes: 4, no: 1 },
    { label: 'Lentes', yes: 3, no: 2 },
    { label: 'Diabético', yes: 1, no: 4 },
    { label: 'Otras enf.', yes: 2, no: 3 }
  ];

  /** Sanitizer used to safely project SVG icons into the DOM. */
  private readonly sanitizer = inject(DomSanitizer);

  /**
   * Build the metrics dataset as soon as the component is created.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.initializeMetrics();
  }

  /**
   * Prepares the metric cards list and stores the sanitized SVG icon for each one.
   */
  private initializeMetrics(): void {
    const rawMetrics: DashboardMetric[] = [
      {
        id: 'total',
        label: 'Total Clients',
        value: 5,
        subtitle: 'Activos en el sistema',
        accentColorClass: 'bg-blue-100 text-blue-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>`
      },
      {
        id: 'drivers',
        label: 'Manejan',
        value: 4,
        subtitle: '80% de los clientes',
        accentColorClass: 'bg-emerald-100 text-emerald-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="m9 11 3 3L22 4"/>
        </svg>`
      },
      {
        id: 'glasses',
        label: 'Usan Lentes',
        value: 3,
        subtitle: '60% de los clientes',
        accentColorClass: 'bg-purple-100 text-purple-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="15" r="4"/>
          <circle cx="18" cy="15" r="4"/>
          <path d="M14 15a2 2 0 0 0-4 0"/>
          <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2"/>
          <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2"/>
        </svg>`
      },
      {
        id: 'diabetes',
        label: 'Diabeticos',
        value: 1,
        subtitle: '20% de los clientes',
        accentColorClass: 'bg-rose-100 text-rose-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`
      }
    ];

    this.metrics = rawMetrics.map(metric => ({
      ...metric,
      safeIconSvg: this.sanitizer.bypassSecurityTrustHtml(metric.iconSvg)
    }));
  }

  /**
   * When charts are part of the DOM, lazily instantiate them once Chart.js is registered.
   */
  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const checkChart = setInterval(() => {
        if (Chart) {
          clearInterval(checkChart);
          this.initializePieChart();
          this.initializeBarChart();
          this.initializeUserStatusChart();
          this.initializeConditionComparisonChart();
        }
      }, 100);
    }
  }

  /**
   * Creates the health factors pie chart instance.
   */
  private initializePieChart(): void {
    if (!this.pieChartCanvas || !Chart) return;
    
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: any = {
      type: 'pie',
      data: {
        labels: this.healthFactorSlices.map(slice => slice.label),
        datasets: [{
          data: this.healthFactorSlices.map(slice => slice.value),
          backgroundColor: this.healthFactorSlices.map(slice => slice.color),
          borderWidth: 0,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (context: any) => {
                const label = context.label || '';
                const value = context.parsed || 0;
                return `${label}: ${value}`;
              }
            }
          }
        }
      }
    };

    this.pieChart = new Chart(ctx, config);
  }

  /**
   * Creates the age distribution bar chart instance.
   */
  private initializeBarChart(): void {
    if (!this.barChartCanvas || !Chart) return;
    
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: any = {
      type: 'bar',
      data: {
        labels: this.ageDistribution.map(bucket => bucket.label),
        datasets: [{
          data: this.ageDistribution.map(bucket => bucket.value),
          backgroundColor: '#3b82f6',
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            },
            grid: {
              display: true,
              color: '#f1f5f9'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.barChart = new Chart(ctx, config);
  }

  /**
   * Creates the bar chart highlighting how many users are active vs inactive.
   */
  private initializeUserStatusChart(): void {
    if (!this.userStatusChartCanvas || !Chart) return;

    const ctx = this.userStatusChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: any = {
      type: 'bar',
      data: {
        labels: this.userStatusStats.map(bucket => bucket.label),
        datasets: [
          {
            data: this.userStatusStats.map(bucket => bucket.value),
            backgroundColor: '#facc15',
            borderRadius: 8,
            borderSkipped: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: {
              display: true,
              color: '#f1f5f9'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.userStatusChart = new Chart(ctx, config);
  }

  /**
   * Creates the grouped bar chart comparing clients that have vs do not have each condition.
   */
  private initializeConditionComparisonChart(): void {
    if (!this.comparisonChartCanvas || !Chart) return;

    const ctx = this.comparisonChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const config: any = {
      type: 'bar',
      data: {
        labels: this.conditionComparison.map(item => item.label),
        datasets: [
          {
            label: 'No',
            data: this.conditionComparison.map(item => item.no),
            backgroundColor: '#ef4444',
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.5
          },
          {
            label: 'Sí',
            data: this.conditionComparison.map(item => item.yes),
            backgroundColor: '#22c55e',
            borderRadius: 6,
            borderSkipped: false,
            barPercentage: 0.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true }
          },
          tooltip: { enabled: true }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: {
              display: true,
              color: '#f1f5f9'
            }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    };

    this.comparisonChart = new Chart(ctx, config);
  }

  /**
   * Tear down Chart.js instances so they do not leak memory when the component is destroyed.
   */
  ngOnDestroy(): void {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
    if (this.userStatusChart) {
      this.userStatusChart.destroy();
    }
    if (this.comparisonChart) {
      this.comparisonChart.destroy();
    }
  }
}
