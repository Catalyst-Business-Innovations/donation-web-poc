import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { DonationDepartment } from '@core/models/domain.models';
import { SelectedItemsMap } from '../../models/new-donation.state';
import { buildItemKey, computeDeptCount } from '../../models/new-donation.mapper';

@Component({
  selector: 'app-add-items-step',
  standalone: true,
  imports: [],
  templateUrl: './add-items-step.component.html',
  styleUrl: './add-items-step.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddItemsStepComponent {
  readonly departments = input.required<DonationDepartment[]>();
  readonly selectedItems = input.required<SelectedItemsMap>();

  readonly itemAdjusted = output<{ key: string; delta: number }>();

  protected activeDept = signal('clothes');

  protected key(dept: string, cat?: string | null, sub?: string | null): string {
    return buildItemKey(dept, cat, sub);
  }

  protected getQty(dept: string, cat?: string | null, sub?: string | null): number {
    return this.selectedItems()[this.key(dept, cat, sub)]?.qty ?? 0;
  }

  protected adjust(k: string, d: number): void {
    this.itemAdjusted.emit({ key: k, delta: d });
  }

  protected addOne(k: string): void {
    this.itemAdjusted.emit({ key: k, delta: 1 });
  }

  protected deptCount(deptKey: string): number {
    return computeDeptCount(this.selectedItems(), deptKey);
  }
}
