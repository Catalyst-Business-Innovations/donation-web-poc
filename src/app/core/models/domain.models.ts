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
export enum DonationMethod   { WalkIn = 1, Scheduled, Pickup }
export enum DonationScope      { Items = 1, Monetary, Both }

// ── Phase 1 enums ────────────────────────────────────────────────────────────
export enum PointsCalcMethod   { PerItem = 1, PerWeight }   // PerWeight disabled by default
export enum RewardType          { Discount = 1, Cashback, Gift, Voucher }
export enum RedemptionStatus    { Pending = 1, Approved, Rejected, Fulfilled, Cancelled }
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
export const DonationMethodLabel: Record<DonationMethod, string> = {
  [DonationMethod.WalkIn]:    'Walk-in',
  [DonationMethod.Scheduled]: 'Scheduled',
  [DonationMethod.Pickup]:    'Pickup',
};
export const DonationScopeLabel: Record<DonationScope, string> = {
  [DonationScope.Items]:    'Donate Items',
  [DonationScope.Monetary]: 'Monetary Donation',
  [DonationScope.Both]:     'Items & Monetary',
};
export const RewardTypeLabel: Record<RewardType, string> = {
  [RewardType.Discount]: 'Discount',
  [RewardType.Cashback]: 'Cashback',
  [RewardType.Gift]:     'Gift',
  [RewardType.Voucher]:  'Voucher',
};
export const RedemptionStatusLabel: Record<RedemptionStatus, string> = {
  [RedemptionStatus.Pending]:   'Pending',
  [RedemptionStatus.Approved]:  'Approved',
  [RedemptionStatus.Rejected]:  'Rejected',
  [RedemptionStatus.Fulfilled]: 'Fulfilled',
  [RedemptionStatus.Cancelled]: 'Cancelled',
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
  pointsPerDollar: number;           // Reward conversion: how many points = $1
  pointsCalcMethod: PointsCalcMethod;
  requireApproval: boolean;           // true = manual approval, false = auto-approve
  emailReqs: {
    forReceipt: boolean;
    forLogin: boolean;
    forCampaigns: boolean;
  };
}

/** Defines a redeemable reward (Req 5) */
export interface RewardDefinition {
  id: number;
  referenceNumber: string;
  name: string;
  description: string;
  pointsRequired: number;
  rewardType: RewardType;
  value: number;                   // dollar value of the reward
  validFrom?: Date;
  validTo?: Date;
  isActive: boolean;
  isGiftable?: boolean;            // whether this reward can be gifted to another donor
  maxRedemptionsPerUser?: number;
  totalRedemptionLimit?: number;
  totalRedemptions: number;
  createdAt: Date;
}

/** Records a single reward redemption (Req 5, 7) */
export interface RewardTransaction {
  id: number;
  referenceNumber: string;
  donorId: number;
  donorName: string;
  rewardId: number;
  rewardName: string;
  rewardType: RewardType;
  rewardValue: number;
  pointsUsed: number;
  status: RedemptionStatus;
  voucherCode?: string;
  createdAt: Date;
  approvedAt?: Date;
  fulfilledAt?: Date;
  rejectedAt?: Date;
  cancelledAt?: Date;
  rejectionReason?: string;
  /** Gifting fields */
  isGift?: boolean;
  giftedToId?: number;     // set on gifter's txn
  giftedToName?: string;   // set on gifter's txn
  giftedFromId?: number;   // set on recipient's txn
  giftedFromName?: string; // set on recipient's txn
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

/** Supported merge variables for campaign templates */
export const TemplateMergeVariables = [
  { key: '{{donor_name}}',    label: 'Donor Name',     sample: 'John Smith' },
  { key: '{{first_name}}',    label: 'First Name',     sample: 'John' },
  { key: '{{campaign_name}}', label: 'Campaign Name',  sample: 'Winter Jacket Drive' },
  { key: '{{points}}',        label: 'Points Balance', sample: '1,250' },
  { key: '{{tier}}',          label: 'Loyalty Tier',   sample: 'Gold' },
  { key: '{{org_name}}',      label: 'Organization',   sample: 'Our Organization' },
] as const;

// ── Email Block Builder types ──────────────────────────────────────────────
export type EmailBlockType = 'header' | 'text' | 'button' | 'divider' | 'image' | 'spacer';
export type EmailBlockAlign = 'left' | 'center' | 'right';

export interface EmailBlock {
  id: string;
  type: EmailBlockType;
  content: string;
  align: EmailBlockAlign;
  /** Button URL, image alt text, etc. */
  meta?: string;
  /** Heading level for headers (1-3), spacer height in px */
  level?: number;
}

/** A pre-built starter template for the email builder */
export interface EmailStarterTemplate {
  name: string;
  description: string;
  icon: string;
  subject: string;
  blocks: EmailBlock[];
}

/** Built-in starter templates */
export const EMAIL_STARTER_TEMPLATES: EmailStarterTemplate[] = [
  {
    name: 'Blank',
    description: 'Start from scratch',
    icon: 'file',
    subject: '',
    blocks: [
      { id: 's0', type: 'text', content: '', align: 'left' },
    ],
  },
  {
    name: 'Donation Appeal',
    description: 'Ask past donors to donate again',
    icon: 'gift',
    subject: 'We Need Your Help Again, {{first_name}}!',
    blocks: [
      { id: 's1', type: 'header', content: '{{campaign_name}}', align: 'center', level: 1 },
      { id: 's2', type: 'divider', content: '', align: 'center' },
      { id: 's3', type: 'text', content: 'Hi <strong>{{donor_name}}</strong>,\n\nAs a valued <strong>{{tier}}</strong> member of {{org_name}}, we\'re reaching out because your past donations have made a real difference in our community.', align: 'left' },
      { id: 's4', type: 'text', content: 'We\'re launching <strong>{{campaign_name}}</strong> and we\'d love your support. Every contribution counts!', align: 'left' },
      { id: 's5', type: 'button', content: 'Donate Now', align: 'center', meta: 'https://donate.example.com' },
      { id: 's6', type: 'spacer', content: '', align: 'center', level: 20 },
      { id: 's7', type: 'text', content: 'You currently have <strong>{{points}} points</strong>. Donate during this campaign to earn bonus points!\n\nThank you for your generosity,\nThe {{org_name}} Team', align: 'left' },
    ],
  },
  {
    name: 'Thank You',
    description: 'Post-campaign thank you note',
    icon: 'star',
    subject: 'Thank You, {{first_name}}! 🎉',
    blocks: [
      { id: 's1', type: 'header', content: 'Thank You!', align: 'center', level: 1 },
      { id: 's2', type: 'divider', content: '', align: 'center' },
      { id: 's3', type: 'text', content: 'Dear <strong>{{donor_name}}</strong>,\n\nOn behalf of the entire {{org_name}} team, we want to sincerely thank you for your generous donation to <strong>{{campaign_name}}</strong>.', align: 'left' },
      { id: 's4', type: 'text', content: 'Your contribution directly supports our mission of serving the community. As a <strong>{{tier}}</strong> member, you\'ve been instrumental in making this campaign a success.', align: 'left' },
      { id: 's5', type: 'text', content: 'Your loyalty account now has <strong>{{points}} points</strong>. Keep donating to unlock even more rewards!', align: 'center' },
      { id: 's6', type: 'button', content: 'View My Rewards', align: 'center', meta: 'https://rewards.example.com' },
      { id: 's7', type: 'spacer', content: '', align: 'center', level: 16 },
      { id: 's8', type: 'text', content: 'With gratitude,\nThe {{org_name}} Team', align: 'left' },
    ],
  },
  {
    name: 'Event Invite',
    description: 'Invite donors to a special event',
    icon: 'calendar',
    subject: 'You\'re Invited, {{first_name}}!',
    blocks: [
      { id: 's1', type: 'header', content: 'You\'re Invited!', align: 'center', level: 1 },
      { id: 's2', type: 'text', content: 'Hi <strong>{{first_name}}</strong>,\n\nAs one of our most valued <strong>{{tier}}</strong> donors, we\'d love you to join us for a special event.', align: 'left' },
      { id: 's3', type: 'header', content: '{{campaign_name}}', align: 'center', level: 2 },
      { id: 's4', type: 'text', content: 'Join us for an exclusive event where you can learn about the impact of your donations and connect with other supporters.', align: 'center' },
      { id: 's5', type: 'button', content: 'RSVP Now', align: 'center', meta: 'https://rsvp.example.com' },
      { id: 's6', type: 'divider', content: '', align: 'center' },
      { id: 's7', type: 'text', content: 'We look forward to seeing you there!\n\nBest,\n{{org_name}}', align: 'left' },
    ],
  },
  {
    name: 'Points Reminder',
    description: 'Remind donors about loyalty points',
    icon: 'trending-up',
    subject: '{{first_name}}, You Have {{points}} Points!',
    blocks: [
      { id: 's1', type: 'header', content: 'Your Points Update', align: 'center', level: 1 },
      { id: 's2', type: 'divider', content: '', align: 'center' },
      { id: 's3', type: 'text', content: 'Hi <strong>{{donor_name}}</strong>,\n\nJust a friendly reminder — you have <strong>{{points}} loyalty points</strong> in your {{org_name}} account!', align: 'left' },
      { id: 's4', type: 'text', content: 'As a <strong>{{tier}}</strong> member, you can redeem your points for exclusive rewards and discounts.', align: 'left' },
      { id: 's5', type: 'button', content: 'Browse Rewards', align: 'center', meta: 'https://rewards.example.com' },
      { id: 's6', type: 'text', content: 'Donate during <strong>{{campaign_name}}</strong> to earn even more points!\n\n— The {{org_name}} Team', align: 'left' },
    ],
  },
];

/** A notification template attached to a campaign */
export interface NotificationTemplate {
  channel: NotificationChannel;
  subject: string;           // Email subject line (unused for SMS)
  body: string;              // HTML for Email, plain text for SMS
  blocks?: EmailBlock[];     // Block-based structure for the visual builder
  updatedAt: Date;
}

/** A log entry from a campaign notification run (Req 6) */
export interface CampaignNotification {
  donorId: number;
  donorName: string;
  channel: NotificationChannel;
  sentAt: Date;
  success: boolean;
  failureReason?: string;
}

/** A donor-targeting campaign (Req 6) */
export interface Campaign {
  id: number;
  referenceNumber: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: CampaignStatus;
  channel: NotificationChannel;
  targetCriteria: CampaignTargetCriteria[];
  notificationHistory: CampaignNotification[];
  emailTemplate?: NotificationTemplate;
  smsTemplate?: NotificationTemplate;
  createdAt: Date;
  createdByStaffId: number;
}

export interface Donor {
  id: number;
  referenceNumber: string;
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
  preferredLocationId?: number;
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
  id: number;
  referenceNumber: string;
  donationId: number;
  categoryKey: string;
  subCategoryKey?: string;
  categoryName: string;
  quantity: number;
  estimatedValuePerItem: number;
  totalEstimatedValue: number;
  condition?: ItemCondition;
}

export interface Donation {
  id: number;
  referenceNumber: string;
  receiptNumber: string;
  donorId?: number;
  donorName?: string;
  donorInitials?: string;
  donorTier?: DonorTier;
  locationId: number;
  locationName: string;
  attendantId: number;
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
  associatedDonorId?: number;
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
  id: number;
  referenceNumber: string;
  barcode: string;
  donationId?: number;
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
  locationId: number;
  locationName: string;
  createdAt: Date;
  updatedAt: Date;
  presortedAt?: Date;
  totalItems: number;
  totalEstimatedValue: number;
  salvageWeightLbs?: number;
  isSeasonal?: boolean;
  seasonalTag?: string;
  parentContainerId?: number;
  notes?: string;
  closedAt?: Date;
  transferToLocationId?: number;
  transferToLocationName?: string;
  mergedContainerIds?: number[];
}

export interface Location {
  id: number;
  referenceNumber: string;
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
  locationId: number;
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
  staffId: number;
  staffName: string;
  role: StaffRole;
  locationId: number;
  locationName: string;
}

export interface ToastModel {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
}

// DonationStatus and DonationMethod are declared as enums above.
export interface ScheduledDonation {
  id: number;
  referenceNumber: string;
  donorId?: number;
  donorName: string;
  donorPhone?: string;
  donorEmail?: string;
  address?: string;
  locationId?: number;
  locationName?: string;
  method: DonationMethod;
  date: Date;
  timeSlot: string;
  status: DonationStatus;
  itemCount?: number;
  categories?: string[];
  recurring?: string;
  notes?: string;
  createdAt: Date;
}
