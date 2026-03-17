import { DonorTier, LoyaltyTierConfig } from '../../../../../core/models/domain.models';
import { IconName } from '../../../../../shared/components/icon/icon.component';

export interface ImpactItem {
  icon: IconName;
  value: string;
  label: string;
}
export interface Badge {
  icon: IconName;
  label: string;
  earned: boolean;
}

export class DonorDashboardMapper {
  static tierProgress(
    totalDonations: number,
    currentTier: LoyaltyTierConfig,
    nextTier: LoyaltyTierConfig | null
  ): number {
    if (!nextTier) return 100;
    const curr = currentTier.minDonations;
    const next = nextTier.minDonations;
    return Math.min(100, ((totalDonations - curr) / (next - curr)) * 100);
  }

  static impactItems(totalDonations: number, lifetimeValue: number): ImpactItem[] {
    return [
      { icon: 'layers', value: `${totalDonations * 12} lbs`, label: 'Textiles diverted from landfill' },
      { icon: 'users', value: `${totalDonations * 4}`, label: 'Families potentially helped' },
      { icon: 'refresh', value: `${Math.round(totalDonations * 2.4)} kg`, label: 'CO₂ emissions offset' },
      { icon: 'dollar', value: `$${lifetimeValue.toLocaleString()}`, label: 'Community value generated' }
    ];
  }
}
