import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { RecentDonationState } from '../../models/dashboard.state';

@Component({
  selector: 'app-recent-donations-card',
  standalone: true,
  imports: [DatePipe, RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './recent-donations-card.component.html',
  styleUrl: './recent-donations-card.component.scss',
})
export class RecentDonationsCardComponent {
  donations = input.required<RecentDonationState[]>();
}
