import { Donor, DonationDepartment } from '../../../../../core/models/domain.models';
import { SelectedDonor, SelectedItemsMap } from './new-donation.state';

export class NewDonationMapper {
  static donorToSelected(d: Donor): SelectedDonor {
    return {
      id: d.id,
      displayName: `${d.firstName} ${d.lastName}`,
      initials: `${d.firstName[0]}${d.lastName[0]}`.toUpperCase(),
      tier: d.loyaltyTier,
      points: d.loyaltyPoints,
      totalDonations: d.totalDonations
    };
  }

  static totalItems(items: SelectedItemsMap): number {
    return Object.values(items).reduce((s, i) => s + i.qty, 0);
  }

  static totalValue(items: SelectedItemsMap, departments: DonationDepartment[]): number {
    let total = 0;
    for (const [key, entry] of Object.entries(items)) {
      const parts = key.split('::');
      const dept = departments.find(d => d.key === parts[0]);
      const cat  = parts[1] ? dept?.categories.find(c => c.key === parts[1]) : null;
      const sub  = (parts[2] && cat) ? cat.subCategories?.find(s => s.key === parts[2]) : null;
      const base = sub?.estimatedValue ?? cat?.estimatedValue ?? dept?.estimatedValue ?? 0;
      total += (entry.estimatedValue ?? base) * entry.qty;
    }
    return total;
  }

  static estimatedPoints(totalValue: number): number {
    return Math.floor(totalValue / 5);
  }

  static itemKey(deptKey: string, catKey?: string | null, subKey?: string | null): string {
    if (!catKey) return deptKey;
    if (!subKey) return `${deptKey}::${catKey}`;
    return `${deptKey}::${catKey}::${subKey}`;
  }
}
