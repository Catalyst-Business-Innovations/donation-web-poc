import { Donor, DonationDepartment, DonationScope } from '@core/models/domain.models';
import { SelectedDonor, SelectedItemsMap, StepDefinition, ReviewItemState } from './new-donation.state';

export function mapDonorToSelected(d: Donor): SelectedDonor {
  return {
    id: d.id,
    displayName: `${d.firstName} ${d.lastName}`,
    initials: `${d.firstName[0]}${d.lastName[0]}`.toUpperCase(),
    tier: d.loyaltyTier,
    points: d.loyaltyPoints,
    totalDonations: d.totalDonations,
    phone: d.phone
  };
}

export function computeTotalItems(items: SelectedItemsMap): number {
  return Object.values(items).reduce((s, i) => s + i.qty, 0);
}

export function computeTotalValue(items: SelectedItemsMap, departments: DonationDepartment[]): number {
  let total = 0;
  for (const [key, entry] of Object.entries(items)) {
    const parts = key.split('::');
    const dept = departments.find(d => d.key === parts[0]);
    const cat = parts[1] ? dept?.categories.find(c => c.key === parts[1]) : null;
    const sub = parts[2] && cat ? cat.subCategories?.find(s => s.key === parts[2]) : null;
    const base = sub?.estimatedValue ?? cat?.estimatedValue ?? dept?.estimatedValue ?? 0;
    total += (entry.estimatedValue ?? base) * entry.qty;
  }
  return total;
}

export function computeEstimatedPoints(totalValue: number): number {
  return Math.floor(totalValue / 5);
}

export function buildItemKey(deptKey: string, catKey?: string | null, subKey?: string | null): string {
  if (!catKey) return deptKey;
  if (!subKey) return `${deptKey}::${catKey}`;
  return `${deptKey}::${catKey}::${subKey}`;
}

export function buildSteps(donationType: DonationScope | null): StepDefinition[] {
  const base: StepDefinition[] = [
    { n: 1, label: 'Identify Donor' },
    { n: 2, label: 'Donation Type' }
  ];
  if (donationType === DonationScope.Monetary) {
    return [...base, { n: 3, label: 'Add Money' }, { n: 4, label: 'Review' }];
  }
  if (donationType === DonationScope.Both) {
    return [...base, { n: 3, label: 'Add Items' }, { n: 4, label: 'Add Money' }, { n: 5, label: 'Review' }];
  }
  return [...base, { n: 3, label: 'Add Items' }, { n: 4, label: 'Review' }];
}

export function buildReviewItems(
  selectedItems: SelectedItemsMap,
  departments: DonationDepartment[]
): ReviewItemState[] {
  return Object.entries(selectedItems).map(([key, entry]) => {
    const parts = key.split('::');
    const dept = departments.find(d => d.key === parts[0]);
    const cat = parts[1] ? dept?.categories.find(c => c.key === parts[1]) : null;
    const sub = parts[2] && cat ? cat.subCategories?.find(s => s.key === parts[2]) : null;
    const base = sub?.estimatedValue ?? cat?.estimatedValue ?? dept?.estimatedValue ?? 0;
    const name = sub ? `${cat!.name} › ${sub.name}` : cat ? cat.name : `${dept?.name ?? key} (Any)`;
    return { key, name, qty: entry.qty, total: (entry.estimatedValue ?? base) * entry.qty };
  });
}

export function computeDeptCount(selectedItems: SelectedItemsMap, deptKey: string): number {
  return Object.entries(selectedItems)
    .filter(([k]) => k === deptKey || k.startsWith(deptKey + '::'))
    .reduce((s, [, v]) => s + v.qty, 0);
}

export function isAddItemsStep(step: number, donationType: DonationScope | null): boolean {
  return step === 3 && donationType !== DonationScope.Monetary;
}

export function isAddMoneyStep(step: number, donationType: DonationScope | null): boolean {
  return (step === 3 && donationType === DonationScope.Monetary) || (step === 4 && donationType === DonationScope.Both);
}

export function isReviewStep(step: number, donationType: DonationScope | null): boolean {
  return (step === 4 && donationType !== DonationScope.Both) || step === 5;
}

export function getTopTitle(step: number, donationType: DonationScope | null): string {
  if (step === 1) return 'Identify Donor';
  if (step === 2) return 'Select Donation Type';
  if (step === 3) return donationType === DonationScope.Monetary ? 'Add Money' : 'Add Items';
  if (step === 4) return donationType === DonationScope.Both ? 'Add Money' : 'Review & Complete';
  return 'Review & Complete';
}

export function getTopSubtitle(step: number, donationType: DonationScope | null): string {
  if (step === 1) return 'Scan QR, search by phone, or continue anonymously';
  if (step === 2) return "Select how you'd like to donate today";
  if (isAddMoneyStep(step, donationType)) return 'Select amount and payment method';
  if (isAddItemsStep(step, donationType)) return 'Quick-tap categories — complete in under 10 seconds';
  return 'Confirm details and generate receipt';
}
