import {
  DonationStatus,
  DonationStatusLabel,
  DonationMethodLabel,
  DonorTier,
  DonorTierLabel
} from '@core/models/domain.models';
import { StatusBadgeClass, MethodBadgeClass } from './donations.enum';
import {
  ScheduledDonationState,
  ScheduledDonationDetailState,
  CompletedDonationState,
  DonationCountsState,
  DonorSearchResultState
} from './donations.state';
import { ScheduledDonationResponse, CompletedDonationResponse, DonorSearchResponse } from './donations.response';

const DonorTierBadgeClass: Record<DonorTier, string> = {
  [DonorTier.Bronze]: 'badge-gray',
  [DonorTier.Silver]: 'badge-info',
  [DonorTier.Gold]: 'badge-warning',
  [DonorTier.Platinum]: 'badge-purple'
};

export function statusBadgeClass(status: DonationStatus): string {
  return StatusBadgeClass[status] ?? 'badge-gray';
}

export function methodBadgeClass(method: number): string {
  return MethodBadgeClass[method as keyof typeof MethodBadgeClass] ?? 'badge-gray';
}

export function mapScheduledDonationToState(sd: ScheduledDonationResponse): ScheduledDonationState {
  return {
    id: sd.id,
    referenceNumber: sd.referenceNumber,
    donorName: sd.donorName,
    locationName: sd.locationName ?? '\u2014',
    method: sd.method,
    methodLabel: DonationMethodLabel[sd.method] ?? String(sd.method),
    methodBadgeClass: methodBadgeClass(sd.method),
    status: sd.status,
    statusLabel: DonationStatusLabel[sd.status] ?? String(sd.status),
    statusBadgeClass: statusBadgeClass(sd.status),
    date: sd.date,
    time: sd.timeSlot,
    itemCount: sd.itemCount ?? null,
    notes: sd.notes ?? null,
    donorPhone: sd.donorPhone ?? null,
    categories: sd.categories ?? []
  };
}

export function mapScheduledDonationToDetailState(sd: ScheduledDonationResponse): ScheduledDonationDetailState {
  return {
    id: sd.id,
    referenceNumber: sd.referenceNumber,
    donorName: sd.donorName,
    donorPhone: sd.donorPhone ?? null,
    donorEmail: sd.donorEmail ?? null,
    address: sd.address ?? null,
    locationName: sd.locationName ?? '\u2014',
    method: sd.method,
    methodLabel: DonationMethodLabel[sd.method] ?? String(sd.method),
    methodBadgeClass: methodBadgeClass(sd.method),
    status: sd.status,
    statusLabel: DonationStatusLabel[sd.status] ?? String(sd.status),
    statusBadgeClass: statusBadgeClass(sd.status),
    date: sd.date,
    time: sd.timeSlot,
    itemCount: sd.itemCount ?? null,
    categories: sd.categories ?? [],
    recurring: sd.recurring ?? null,
    notes: sd.notes ?? null,
    isScheduledStatus: sd.status === DonationStatus.Scheduled
  };
}

export function mapDonationToCompletedState(d: CompletedDonationResponse): CompletedDonationState {
  return {
    id: d.id,
    referenceNumber: d.referenceNumber,
    receiptNumber: d.receiptNumber,
    donorName: d.donorName ?? null,
    donorInitials: d.donorInitials ?? null,
    donorTier: d.donorTier ?? null,
    donorTierLabel: d.donorTier != null ? (DonorTierLabel[d.donorTier] ?? null) : null,
    donorTierBadgeClass: d.donorTier != null ? (DonorTierBadgeClass[d.donorTier] ?? null) : null,
    locationName: d.locationName,
    timestamp: d.timestamp,
    totalItems: d.totalItems,
    totalEstimatedValue: d.totalEstimatedValue,
    statusLabel: DonationStatusLabel[d.status] ?? String(d.status),
    statusBadgeClass: statusBadgeClass(d.status),
    loyaltyPointsEarned: d.loyaltyPointsEarned ?? null,
    isAnonymous: !d.donorId,
    associatedDonorName: d.associatedDonorName ?? null
  };
}

export function mapDonorToSearchResult(d: DonorSearchResponse): DonorSearchResultState {
  return {
    id: d.id,
    firstName: d.firstName,
    lastName: d.lastName,
    initials: `${d.firstName?.[0] ?? ''}${d.lastName?.[0] ?? ''}`,
    phone: d.phone,
    loyaltyPoints: d.loyaltyPoints
  };
}

export function computeDonationCounts(scheduledDonations: ScheduledDonationResponse[]): DonationCountsState {
  return {
    scheduled: scheduledDonations.filter(a => a.status === DonationStatus.Scheduled).length,
    checkedIn: scheduledDonations.filter(a => a.status === DonationStatus.CheckedIn).length,
    completed: scheduledDonations.filter(a => a.status === DonationStatus.Completed).length,
    cancelled: scheduledDonations.filter(a => a.status === DonationStatus.Cancelled).length,
    total: scheduledDonations.length
  };
}
