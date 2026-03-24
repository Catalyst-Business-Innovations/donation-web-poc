import { Donation, Donor, Campaign, LoyaltyTierConfig } from '@core/models/domain.models';
import {
  DonorStatsState,
  TierDisplayState,
  ImpactItemState,
  RecentDonationState,
  CampaignSummaryState,
  BadgeState
} from './dashboard.state';

export const mapDonorToStats = (donor: Donor): DonorStatsState => ({
  firstName: donor.firstName,
  lastName: donor.lastName,
  joinDate: donor.joinDate,
  totalDonations: donor.totalDonations,
  loyaltyPoints: donor.loyaltyPoints,
  lifetimeValue: donor.lifetimeValue
});

export const mapDonorToTierDisplay = (
  donor: Donor,
  currentTier: LoyaltyTierConfig,
  tiers: LoyaltyTierConfig[]
): TierDisplayState => {
  const idx = tiers.findIndex(t => t.tier === donor.loyaltyTier);
  const nextTier = idx < tiers.length - 1 ? tiers[idx + 1] : null;

  let progress = 100;
  if (nextTier) {
    const curr = currentTier.minDonations;
    const next = nextTier.minDonations;
    progress = Math.min(100, ((donor.totalDonations - curr) / (next - curr)) * 100);
  }

  return {
    tier: currentTier,
    nextTier,
    progress,
    donationsToNext: nextTier ? nextTier.minDonations - donor.totalDonations : 0
  };
};

export const mapDonorToImpactItems = (donor: Donor): ImpactItemState[] => [
  { icon: 'layers', value: `${donor.totalDonations * 12} lbs`, label: 'Textiles diverted from landfill' },
  { icon: 'users', value: `${donor.totalDonations * 4}`, label: 'Families potentially helped' },
  { icon: 'refresh', value: `${Math.round(donor.totalDonations * 2.4)} kg`, label: 'CO\u2082 emissions offset' },
  { icon: 'dollar', value: `$${donor.lifetimeValue.toLocaleString()}`, label: 'Community value generated' }
];

export const mapDonationToRecentDonation = (d: Donation): RecentDonationState => ({
  id: d.id,
  locationName: d.locationName,
  timestamp: d.timestamp,
  totalItems: d.totalItems,
  loyaltyPointsEarned: d.loyaltyPointsEarned ?? 0
});

export const mapCampaignToSummary = (c: Campaign): CampaignSummaryState => ({
  id: c.id,
  name: c.name,
  description: c.description,
  startDate: c.startDate,
  endDate: c.endDate
});

export const mapDonorToBadges = (donor: Donor): BadgeState[] => [
  { icon: 'star', label: 'First Donation', earned: true },
  { icon: 'list', label: '10 Donations', earned: donor.totalDonations >= 10 },
  { icon: 'check-circle', label: '25 Donations', earned: donor.totalDonations >= 25 },
  { icon: 'trending-up', label: '50 Donations', earned: donor.totalDonations >= 50 },
  { icon: 'users', label: 'Community Hero', earned: donor.lifetimeValue >= 5000 },
  { icon: 'calendar', label: 'Year-Round Donor', earned: false }
];
