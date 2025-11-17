import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, ViewChild, AfterViewInit, inject, PLATFORM_ID, Inject, OnDestroy, OnInit, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SidebarComponent, SidebarLink } from '../../shared/components/sidebar/sidebar.component';
import { CompanyBranding, DEFAULT_COMPANY_BRANDING } from '../../shared/models/branding.model';
import { PersonService } from '../../core/services/person.service';
import { PersonResponse } from '../../shared/models/person.model';

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

interface DashboardAggregations {
  total: number;
  active: number;
  inactive: number;
  drivers: number;
  glasses: number;
  diabetics: number;
  otherDiseases: number;
  ageBuckets: AgeDistributionBucket[];
}

@Component({
  standalone: true,
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
  imports: [CommonModule, SidebarComponent]
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
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

  /** Raw dataset retrieved from the API. */
  persons: PersonResponse[] = [];

  /** Data series used by the health factors pie chart. */
  healthFactorSlices: HealthFactorSlice[] = [];

  /** Data series used by the age distribution bar chart. */
  ageDistribution: AgeDistributionBucket[] = [];

  /** Dataset representing how many users are active vs inactive. */
  userStatusStats: UserStatusBucket[] = [];

  /** Comparison dataset that splits each condition between yes/no counts. */
  conditionComparison: ConditionComparisonBucket[] = [];

  /** Sanitizer used to safely project SVG icons into the DOM. */
  private readonly sanitizer = inject(DomSanitizer);
  private readonly personService = inject(PersonService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private viewInitialized = false;

  /**
   * Build initial datasets as soon as the component is created.
   */
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.rebuildDashboardData();
  }

  ngOnInit(): void {
    this.loadPersons();
  }

  private loadPersons(): void {
    this.personService
      .getPersons()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (persons) => {
          this.persons = Array.isArray(persons) ? persons : [];
          this.rebuildDashboardData();
        },
        error: (error) => {
          console.error('Failed to load persons for dashboard', error);
          this.persons = [];
          this.rebuildDashboardData();
        }
      });
  }

  private rebuildDashboardData(): void {
    const stats = this.computeAggregations();
    this.metrics = this.buildMetrics(stats);
    this.healthFactorSlices = this.buildHealthFactorSlices(stats);
    this.ageDistribution = stats.ageBuckets;
    this.userStatusStats = this.buildUserStatusStats(stats);
    this.conditionComparison = this.buildConditionComparison(stats);
    this.updateCharts();
    this.detectChanges();
  }

  private computeAggregations(): DashboardAggregations {
    const ageBuckets: AgeDistributionBucket[] = [
      { label: '18-30', value: 0, color: '#60a5fa' },
      { label: '31-40', value: 0, color: '#3b82f6' },
      { label: '41-50', value: 0, color: '#2563eb' },
      { label: '51-60', value: 0, color: '#1d4ed8' }
    ];

    let active = 0;
    let drivers = 0;
    let glasses = 0;
    let diabetics = 0;
    let otherDiseases = 0;

    for (const person of this.persons) {
      if (person.active) {
        active++;
      }
      if (person.drives) {
        drivers++;
      }
      if (person.wearsGlasses) {
        glasses++;
      }
      if (person.diabetic) {
        diabetics++;
      }
      if (person.otherDisease) {
        otherDiseases++;
      }
      this.assignAgeToBucket(person.age, ageBuckets);
    }

    const total = this.persons.length;

    return {
      total,
      active,
      inactive: Math.max(total - active, 0),
      drivers,
      glasses,
      diabetics,
      otherDiseases,
      ageBuckets
    };
  }

  private assignAgeToBucket(age: number, buckets: AgeDistributionBucket[]): void {
    if (!Number.isFinite(age) || buckets.length === 0) {
      return;
    }

    if (age <= 30) {
      buckets[0].value++;
      return;
    }
    if (age <= 40) {
      buckets[1].value++;
      return;
    }
    if (age <= 50) {
      buckets[2].value++;
      return;
    }
    buckets[3].value++;
  }

  private buildMetrics(stats: DashboardAggregations): DashboardMetric[] {
    const total = stats.total;
    const rawMetrics: DashboardMetric[] = [
      {
        id: 'total',
        label: 'Clientes totales',
        value: total,
        subtitle: `${stats.active} activos en el sistema`,
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
        value: stats.drivers,
        subtitle: `${this.calculatePercentage(stats.drivers, total)}% de los clientes`,
        accentColorClass: 'bg-emerald-100 text-emerald-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <path d="m9 11 3 3L22 4"/>
        </svg>`
      },
      {
        id: 'glasses',
        label: 'Usan Lentes',
        value: stats.glasses,
        subtitle: `${this.calculatePercentage(stats.glasses, total)}% de los clientes`,
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
        value: stats.diabetics,
        subtitle: `${this.calculatePercentage(stats.diabetics, total)}% de los clientes`,
        accentColorClass: 'bg-rose-100 text-rose-700',
        iconSvg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>`
      }
    ];

    return rawMetrics.map(metric => ({
      ...metric,
      safeIconSvg: this.sanitizer.bypassSecurityTrustHtml(metric.iconSvg)
    }));
  }

  private buildHealthFactorSlices(stats: DashboardAggregations): HealthFactorSlice[] {
    return [
      { label: 'Maneja', value: stats.drivers, color: '#8b5cf6' },
      { label: 'Usa lentes', value: stats.glasses, color: '#6366f1' },
      { label: 'Diabetico', value: stats.diabetics, color: '#ec4899' },
      { label: 'Otra enfermedad', value: stats.otherDiseases, color: '#f97316' }
    ];
  }

  private buildUserStatusStats(stats: DashboardAggregations): UserStatusBucket[] {
    return [
      { label: 'Activos', value: stats.active },
      { label: 'Inactivos', value: stats.inactive }
    ];
  }

  private buildConditionComparison(stats: DashboardAggregations): ConditionComparisonBucket[] {
    const total = stats.total;
    const noValue = (yes: number) => Math.max(total - yes, 0);
    return [
      { label: 'Maneja', yes: stats.drivers, no: noValue(stats.drivers) },
      { label: 'Lentes', yes: stats.glasses, no: noValue(stats.glasses) },
      { label: 'Diabetico', yes: stats.diabetics, no: noValue(stats.diabetics) },
      { label: 'Otras enf.', yes: stats.otherDiseases, no: noValue(stats.otherDiseases) }
    ];
  }

  private calculatePercentage(value: number, total: number): number {
    if (total === 0) {
      return 0;
    }
    return Math.round((value / total) * 100);
  }

  private updateCharts(): void {
    if (this.pieChart) {
      this.pieChart.data.labels = this.healthFactorSlices.map(slice => slice.label);
      this.pieChart.data.datasets[0].data = this.healthFactorSlices.map(slice => slice.value);
      this.pieChart.data.datasets[0].backgroundColor = this.healthFactorSlices.map(slice => slice.color);
      this.pieChart.update();
    }

    if (this.barChart) {
      this.barChart.data.labels = this.ageDistribution.map(bucket => bucket.label);
      this.barChart.data.datasets[0].data = this.ageDistribution.map(bucket => bucket.value);
      this.barChart.update();
    }

    if (this.userStatusChart) {
      this.userStatusChart.data.labels = this.userStatusStats.map(bucket => bucket.label);
      this.userStatusChart.data.datasets[0].data = this.userStatusStats.map(bucket => bucket.value);
      this.userStatusChart.update();
    }

    if (this.comparisonChart) {
      this.comparisonChart.data.labels = this.conditionComparison.map(item => item.label);
      if (this.comparisonChart.data.datasets[0]) {
        this.comparisonChart.data.datasets[0].data = this.conditionComparison.map(item => item.no);
      }
      if (this.comparisonChart.data.datasets[1]) {
        this.comparisonChart.data.datasets[1].data = this.conditionComparison.map(item => item.yes);
      }
      this.comparisonChart.update();
    }
  }

  private detectChanges(): void {
    if (!this.viewInitialized || (this.cdr as any)?.destroyed) {
      return;
    }

    queueMicrotask(() => {
      if (!(this.cdr as any)?.destroyed) {
        this.cdr.detectChanges();
      }
    });
  }

  /**
   * When charts are part of the DOM, lazily instantiate them once Chart.js is registered.
   */
  ngAfterViewInit(): void {
    this.viewInitialized = true;
    if (isPlatformBrowser(this.platformId)) {
      const checkChart = setInterval(() => {
        if (Chart) {
          clearInterval(checkChart);
          this.initializePieChart();
          this.initializeBarChart();
          this.initializeUserStatusChart();
          this.initializeConditionComparisonChart();
          this.detectChanges();
        }
      }, 100);
    }
    this.detectChanges();
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


