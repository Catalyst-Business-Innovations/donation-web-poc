import { IconName } from '../../shared/components/icon/icon.component';

export enum DonorTier       { Bronze = 1, Silver, Gold, Platinum }
export enum ContainerStatus { Available = 1, ReadyForSorting, Sorting, InUse }
export enum ContainerDest   { Production = 1, Reserve, Warehouse, Transfer, Salvage, Ecommerce }
export enum ItemCondition   { Sellable = 1, NeedsRefurbishment, Salvage, Dispose }
export enum ContainerType   { Gaylord = 1, CartRack, Pallet, Tote, Baler }
export enum PresortMethod   { DockSide = 1, Batch }
export enum PaymentMethod   { CreditCard = 1, DebitCard, ApplePay, GooglePay, Cash }
export enum ReceiptDelivery { Email = 1, SMS, Print, None }
export enum LocationStatus  { Open = 1, Closed, Busy }
export enum StaffRole       { Attendant = 1, PresortWorker, Manager, Admin }
export enum DonationStatus { Scheduled = 1, CheckedIn, Completed, Cancelled, NoShow }
export enum ScheduledDonationType   { WalkIn = 1, Scheduled, Pickup }
export enum DonationType      { Items = 1, Monetary, Both }

// ── Phase 1 enums ────────────────────────────────────────────────────────────
export enum PointsCalcMethod   { PerItem = 1, PerWeight }   // PerWeight disabled by default
export enum RewardStatus        { Active = 1, Redeemed, Gifted, Expired }
export enum CampaignStatus      { Draft = 1, Active, Paused, Completed }
export enum NotificationChannel { Email = 1, SMS, Both }

// ── Display label maps (used by components and templates) ────────────────────
export const DonorTierLabel: Record<DonorTier, string> = {
  [DonorTier.Bronze]:   'Bronze',
  [DonorTier.Silver]:   'Silver',
  [DonorTier.Gold]:     'Gold',
  [DonorTier.Platinum]: 'Platinum',
};
export const DonationStatusLabel: Record<DonationStatus, string> = {
  [DonationStatus.Scheduled]: 'Scheduled',
  [DonationStatus.CheckedIn]: 'Checked In',
  [DonationStatus.Completed]: 'Completed',
  [DonationStatus.Cancelled]: 'Cancelled',
  [DonationStatus.NoShow]:    'No Show',
};
export const ContainerStatusLabel: Record<ContainerStatus, string> = {
  [ContainerStatus.Available]:       'Available',
  [ContainerStatus.ReadyForSorting]: 'Ready for Sorting',
  [ContainerStatus.Sorting]:         'Sorting',
  [ContainerStatus.InUse]:           'In Use',
};
export const ContainerDestLabel: Record<ContainerDest, string> = {
  [ContainerDest.Production]: 'Production',
  [ContainerDest.Reserve]:    'Reserve',
  [ContainerDest.Warehouse]:  'Warehouse',
  [ContainerDest.Transfer]:   'Transfer',
  [ContainerDest.Salvage]:    'Salvage',
  [ContainerDest.Ecommerce]:  'E-Commerce',
};
export const ItemConditionLabel: Record<ItemCondition, string> = {
  [ItemCondition.Sellable]:            'Sellable',
  [ItemCondition.NeedsRefurbishment]:  'Needs Refurb',
  [ItemCondition.Salvage]:             'Salvage',
  [ItemCondition.Dispose]:             'Dispose',
};
export const ContainerTypeLabel: Record<ContainerType, string> = {
  [ContainerType.Gaylord]:  'Gaylord',
  [ContainerType.CartRack]: 'Cart / Rack',
  [ContainerType.Pallet]:   'Pallet',
  [ContainerType.Tote]:     'Tote / Bin',
  [ContainerType.Baler]:    'Baler',
};
export const PresortMethodLabel: Record<PresortMethod, string> = {
  [PresortMethod.DockSide]: 'Dock-Side',
  [PresortMethod.Batch]:    'Batch',
};
export const ReceiptDeliveryLabel: Record<ReceiptDelivery, string> = {
  [ReceiptDelivery.Email]: 'Email',
  [ReceiptDelivery.SMS]:   'SMS',
  [ReceiptDelivery.Print]: 'Print',
  [ReceiptDelivery.None]:  'No Receipt',
};
export const LocationStatusLabel: Record<LocationStatus, string> = {
  [LocationStatus.Open]:   'Open',
  [LocationStatus.Closed]: 'Closed',
  [LocationStatus.Busy]:   'Busy',
};
export const ScheduledDonationTypeLabel: Record<ScheduledDonationType, string> = {
  [ScheduledDonationType.WalkIn]:    'Walk-in',
  [ScheduledDonationType.Scheduled]: 'Scheduled',
  [ScheduledDonationType.Pickup]:    'Pickup',
};
export const DonationTypeLabel: Record<DonationType, string> = {
  [DonationType.Items]:    'Donate Items',
  [DonationType.Monetary]: 'Monetary Donation',
  [DonationType.Both]:     'Items & Monetary',
};
export const RewardStatusLabel: Record<RewardStatus, string> = {
  [RewardStatus.Active]:   'Active',
  [RewardStatus.Redeemed]: 'Redeemed',
  [RewardStatus.Gifted]:   'Gifted',
  [RewardStatus.Expired]:  'Expired',
};
export const CampaignStatusLabel: Record<CampaignStatus, string> = {
  [CampaignStatus.Draft]:     'Draft',
  [CampaignStatus.Active]:    'Active',
  [CampaignStatus.Paused]:    'Paused',
  [CampaignStatus.Completed]: 'Completed',
};
export const NotificationChannelLabel: Record<NotificationChannel, string> = {
  [NotificationChannel.Email]: 'Email',
  [NotificationChannel.SMS]:   'SMS',
  [NotificationChannel.Both]:  'Email & SMS',
};

// ── Phase 1 interfaces ────────────────────────────────────────────────────────

/** System-wide configuration flags (Req 2, 3, 4) */
export interface AppConfig {
  isCashAccepted: boolean;
  associationWindowHours: number;   // Req 1 — how long staff can link an anon donation
  pointsPerItem: number;            // Req 4
  pointsCalcMethod: PointsCalcMethod;
  emailReqs: {
    forReceipt: boolean;
    forLogin: boolean;
    forCampaigns: boolean;
  };
}

/** Defines a redeemable reward tier (Req 5) */
export interface RewardDefinition {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  discountValue: number;   // dollar discount at POS
  icon: string;
  active: boolean;
  sortOrder: number;
}

/** Records a single reward redemption or gift (Req 5, 7) */
export interface RewardTransaction {
  id: string;
  donorId: string;
  donorName: string;
  definitionId: string;
  definitionName: string;
  pointsDeducted: number;
  status: RewardStatus;
  createdAt: Date;
  redeemedAt?: Date;
  giftedToName?: string;       // Req 7
  giftedToContact?: string;    // phone or email of recipient
}

/** A single targeting criterion for a campaign (Req 6) */
export interface CampaignTargetCriteria {
  departmentKey?: string;
  departmentName?: string;
  categoryKey?: string;
  categoryName?: string;
  subCategoryKey?: string;
  subCategoryName?: string;
  attributeKey?: string;    // future: e.g. "color"
  attributeValue?: string;  // future: e.g. "Red"
}

/** A log entry from a campaign notification run (Req 6) */
export interface CampaignNotification {
  donorId: string;
  donorName: string;
  channel: NotificationChannel;
  sentAt: Date;
  success: boolean;
  failureReason?: string;
}

/** A donor-targeting campaign (Req 6) */
export interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  channel: NotificationChannel;
  targetCriteria: CampaignTargetCriteria[];
  notificationHistory: CampaignNotification[];
  createdAt: Date;
  createdByStaffId: string;
}

export interface Donor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  loyaltyTier: DonorTier;
  loyaltyPoints: number;
  totalDonations: number;
  lifetimeValue: number;
  joinDate: Date;
  lastDonationDate?: Date;
  preferredLocationId?: string;
}

export interface SubCategory {
  key: string;
  name: string;
  icon: string;
  estimatedValue: number;
}

export interface DonationCategory {
  key: string;
  name: string;
  icon: string;
  color: string;
  estimatedValue: number;
  active: boolean;
  sortOrder: number;
  subCategories?: SubCategory[];
}

/** Mid-level category within a department (donation wizard) */
export interface DeptCategory {
  key: string;
  name: string;
  estimatedValue: number;
  subCategories?: SubCategory[];
}

export interface DonationDepartment {
  key: string;
  name: string;
  icon: string;
  color: string;
  estimatedValue: number;
  active: boolean;
  sortOrder: number;
  categories: DeptCategory[];
}

export interface DonationItem {
  id: string;
  donationId: string;
  categoryKey: string;
  subCategoryKey?: string;
  categoryName: string;
  quantity: number;
  estimatedValuePerItem: number;
  totalEstimatedValue: number;
  condition?: ItemCondition;
}

export interface Donation {
  id: string;
  receiptNumber: string;
  donorId?: string;
  donorName?: string;
  donorInitials?: string;
  donorTier?: DonorTier;
  locationId: string;
  locationName: string;
  attendantId: string;
  timestamp: Date;
  status: DonationStatus;
  items: DonationItem[];
  totalItems: number;
  totalEstimatedValue: number;
  loyaltyPointsEarned?: number;
  presortCompleted?: boolean;
  isPreSorted?: boolean;
  notes?: string;
  /** Req 1 — populated when an anonymous donation is linked to a donor post-payment */
  associatedDonorId?: string;
  associatedDonorName?: string;
  associatedAt?: Date;
}

export interface ContainerContent {
  categoryKey: string;
  categoryName: string;
  quantity: number;
  condition: ItemCondition;
  ecommerceQty?: number;
}

export interface Container {
  id: string;
  barcode: string;
  donationId?: string;
  donationReceiptNumber?: string;
  donorVisitLabel?: string;
  presortWorkerName?: string;
  containerType: ContainerType;
  presortMethod?: PresortMethod;
  contents: ContainerContent[];
  destination?: ContainerDest;
  status: ContainerStatus;
  /** Primary department this container is sorted into */
  deptKey?: string;
  deptName?: string;
  /** Optional sub-category within the department */
  catKey?: string;
  catName?: string;
  locationId: string;
  locationName: string;
  createdAt: Date;
  updatedAt: Date;
  presortedAt?: Date;
  totalItems: number;
  totalEstimatedValue: number;
  salvageWeightLbs?: number;
  isSeasonal?: boolean;
  seasonalTag?: string;
  parentContainerId?: string;
  notes?: string;
  closedAt?: Date;
  transferToLocationId?: string;
  transferToLocationName?: string;
  mergedContainerIds?: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  managerName?: string;
  staffCount: number;
  status: LocationStatus;
  hours: string;
  donationsToday: number;
  itemsToday: number;
  revenueToday?: number;
}

export interface TrendPoint {
  label: string;
  count: number;
  value: number;
}
export interface CategoryBreak {
  categoryKey: string;
  categoryName: string;
  color: string;
  count: number;
  percentage: number;
}
export interface LocationPerf {
  locationId: string;
  locationName: string;
  totalValue: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalDonations: number;
  totalValue: number;
  activeDonors: number;
  avgProcessTimeMin: number;
  newDonorsThisMonth: number;
  repeatDonorRate: number;
  monetaryDonationVolume: number;
  identificationRate: number;
  trends: TrendPoint[];
  categoryBreakdown: CategoryBreak[];
  topLocations: LocationPerf[];
}

export interface LoyaltyTierConfig {
  tier: DonorTier;
  label: string;
  icon: IconName;
  minDonations: number;
  pointsMultiplier: number;
  color: string;
  bgColor: string;
  perks: string[];
}

export interface StaffSession {
  staffId: string;
  staffName: string;
  role: StaffRole;
  locationId: string;
  locationName: string;
}

export interface ToastModel {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// DonationStatus and ScheduledDonationType are declared as enums above.
export interface ScheduledDonation {
  id: string;
  donorId?: string;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  address?: string;
  locationId?: string;
  locationName?: string;
  type: ScheduledDonationType;
  date: Date;
  timeSlot: string;
  status: DonationStatus;
  itemCount?: number;
  categories?: string[];
  recurring?: string;
  notes?: string;
  createdAt: Date;
}
