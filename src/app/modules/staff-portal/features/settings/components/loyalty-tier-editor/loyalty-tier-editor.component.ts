import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LoyaltyTierState } from '../../models/settings.state';

export interface TierMultiplierChange {
  tier: number;
  pointsMultiplier: number;
  minDonations: number;
}

@Component({
  selector: 'app-loyalty-tier-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './loyalty-tier-editor.component.html',
  styleUrl: './loyalty-tier-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoyaltyTierEditorComponent {
  readonly tiers = input.required<LoyaltyTierState[]>();
  readonly saved = output<TierMultiplierChange[]>();

  protected localTiers: LoyaltyTierState[] = [];

  ngOnChanges(): void {
    this.localTiers = this.tiers().map(t => ({ ...t }));
  }

  protected save(): void {
    this.saved.emit(
      this.localTiers.map(t => ({
        tier: t.tier,
        pointsMultiplier: t.pointsMultiplier,
        minDonations: t.minDonations
      }))
    );
  }
}
