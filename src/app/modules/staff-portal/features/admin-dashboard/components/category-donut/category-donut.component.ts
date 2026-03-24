import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DonutSegmentState, CategoryBreakdownState } from '../../models/admin-dashboard.state';

@Component({
  selector: 'app-category-donut',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './category-donut.component.html',
  styleUrl: './category-donut.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CategoryDonutComponent {
  readonly segments = input.required<DonutSegmentState[]>();
  readonly categories = input.required<CategoryBreakdownState[]>();
  readonly totalDonations = input.required<number>();
}
