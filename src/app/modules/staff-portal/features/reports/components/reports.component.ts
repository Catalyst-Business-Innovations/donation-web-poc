import { Component, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { ReportsMapper } from '../models/reports.models';
import { DonationStatus, DonationStatusLabel } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);
  protected loc = this.mockData.locations[0];

  readonly hourly = ReportsMapper.defaultHourly();
  readonly maxHourly = ReportsMapper.maxHourly(this.hourly);

  readonly categories = [
    { name: 'Clothing', icon: '👔', count: 58, pct: 41, colorClass: 'blue' },
    { name: 'Shoes', icon: '👟', count: 28, pct: 20, colorClass: 'green' },
    { name: 'Books & Media', icon: '📚', count: 22, pct: 15, colorClass: 'yellow' },
    { name: 'Electronics', icon: '📱', count: 18, pct: 13, colorClass: 'blue' },
    { name: 'Other', icon: '📦', count: 16, pct: 11, colorClass: 'red' }
  ];
  protected readonly DS = DonationStatus;
  protected readonly DSL = DonationStatusLabel;
  exportCsv(): void {
    const today = this.mockData.donations
      .filter(d => d.locationId === this.loc.id)
      .slice(0, 50);
    const header = 'Receipt #,Time,Donor,Items,Est. Value,Status';
    const rows = today.map(d =>
      [
        d.receiptNumber,
        d.timestamp.toLocaleTimeString(),
        d.donorName ?? 'Anonymous',
        d.totalItems,
        d.totalEstimatedValue.toFixed(2),
        DonationStatusLabel[d.status] ?? d.status
      ].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    this.toast.success('Exported', 'CSV downloaded successfully.');
  }

  printReport(): void {
    window.print();
  }}
