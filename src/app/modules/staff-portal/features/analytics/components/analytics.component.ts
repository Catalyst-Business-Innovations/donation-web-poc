import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { IconComponent, IconName } from '../../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [DecimalPipe, IconComponent],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  readonly a = this.svc.analytics;
  readonly maxT = Math.max(...this.a.trends.map(t => t.count));

  readonly tiers: { icon: IconName; label: string; threshold: string; count: number; bg: string }[] = [
    { icon: 'gift', label: 'Platinum Members', threshold: '25+ visits', count: 89, bg: '#ede9fe' },
    { icon: 'star', label: 'Gold Members', threshold: '10-24 visits', count: 342, bg: '#fef3c7' },
    { icon: 'trending-up', label: 'Silver Members', threshold: '5-9 visits', count: 891, bg: '#f3f4f6' },
    { icon: 'check-circle', label: 'Bronze Members', threshold: '1-4 visits', count: 2099, bg: '#fef2f2' }
  ];

  readonly fraudAlerts: { id: string; icon: IconName; title: string; detail: string; bg: string; border: string }[] = [
    {
      id: 'FA-001',
      icon: 'alert-circle',
      title: 'High-volume frequency',
      detail: 'Donor #842 — 8 donations in 3 days',
      bg: '#fef3c7',
      border: '#f59e0b'
    },
    {
      id: 'FA-002',
      icon: 'x-circle',
      title: 'Unusual monetary pattern',
      detail: '$4,200 cash at Westside — review required',
      bg: '#fee2e2',
      border: '#ef4444'
    },
    {
      id: 'FA-003',
      icon: 'alert-circle',
      title: 'Estimated value outlier',
      detail: 'Clothing lot at $3,800 — exceeds threshold',
      bg: '#fef3c7',
      border: '#f59e0b'
    }
  ];

  locColor(i: number): string {
    return ['blue', 'green', 'yellow', 'red'][i] ?? 'blue';
  }
}
