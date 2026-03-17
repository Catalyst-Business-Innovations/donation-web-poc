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
}
