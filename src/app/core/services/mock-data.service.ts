import { Injectable, inject, signal } from '@angular/core';
import {
  Donor,
  Location,
  DonationCategory,
  DonationDepartment,
  Container,
  Donation,
  AnalyticsSummary,
  LoyaltyTierConfig,
  StaffSession,
  DonorTier,
  DonationStatus,
  ContainerStatus,
  ContainerDest,
  ContainerType,
  ItemCondition,
  PresortMethod,
  ReceiptDelivery,
  LocationStatus,
  StaffRole,
  DonationMethod,
  AppConfig,
  PointsCalcMethod,
  RewardDefinition,
  RewardTransaction,
  RewardStatus,
  Campaign,
  CampaignStatus,
  CampaignNotification,
  NotificationChannel,
  NotificationTemplate,
  DonorTierLabel,
} from '../models/domain.models';
import { StorageService } from './storage.service';
import { PresortQueueItem } from '../../modules/staff-portal/features/presort/models/presort.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private storage = inject(StorageService);

  readonly session: StaffSession = {
    staffId: 1,
    staffName: 'Alex Morgan',
    role: StaffRole.Attendant,
    locationId: 1,
    locationName: 'Downtown Store'
  };

  // ── Phase 1: System config (Req 2, 3, 4) ──────────────────────────────────
  readonly appConfig = signal<AppConfig>({
    isCashAccepted: true,
    associationWindowHours: 24,
    pointsPerItem: 10,
    pointsCalcMethod: PointsCalcMethod.PerItem,
    emailReqs: {
      forReceipt: false,
      forLogin: false,
      forCampaigns: true,
    },
  });

  updateAppConfig(patch: Partial<AppConfig>): void {
    this.appConfig.update(c => ({ ...c, ...patch }));
  }

  // ── Phase 1: Reward definitions seed data (Req 5) ─────────────────────────
  private _rewardDefs = signal<RewardDefinition[]>([
    { id: 1, referenceNumber: 'RD-001', name: '$5 Discount',   description: 'Redeemable at POS',  pointsRequired: 100,  discountValue: 5,   icon: '🏷️', active: true,  sortOrder: 1 },
    { id: 2, referenceNumber: 'RD-002', name: '$10 Discount',  description: 'Redeemable at POS',  pointsRequired: 200,  discountValue: 10,  icon: '🏷️', active: true,  sortOrder: 2 },
    { id: 3, referenceNumber: 'RD-003', name: '$25 Discount',  description: 'Redeemable at POS',  pointsRequired: 450,  discountValue: 25,  icon: '🎟️', active: true,  sortOrder: 3 },
    { id: 4, referenceNumber: 'RD-004', name: 'Free Pickup',   description: 'One free pickup',     pointsRequired: 300,  discountValue: 0,   icon: '🚚', active: true,  sortOrder: 4 },
    { id: 5, referenceNumber: 'RD-005', name: '$50 Gift Card', description: 'Partner gift card',   pointsRequired: 900,  discountValue: 50,  icon: '🎁', active: true,  sortOrder: 5 },
  ]);
  readonly rewardDefinitions = this._rewardDefs.asReadonly();

  // ── Phase 1: Reward transactions seed data (Req 5, 7) ─────────────────────
  private _rewardTxns = signal<RewardTransaction[]>([
    {
      id: 1, referenceNumber: 'RTX-001', donorId: 1, donorName: 'Michael Johnson',
      definitionId: 1, definitionName: '$5 Discount', pointsDeducted: 100,
      status: RewardStatus.Redeemed, createdAt: new Date('2026-03-10'), redeemedAt: new Date('2026-03-10'),
    },
    {
      id: 2, referenceNumber: 'RTX-002', donorId: 2, donorName: 'Sarah Williams',
      definitionId: 2, definitionName: '$10 Discount', pointsDeducted: 200,
      status: RewardStatus.Gifted, createdAt: new Date('2026-03-12'),
      giftedToName: 'Emma Williams', giftedToContact: 'emma.w@email.com',
    },
  ]);
  readonly rewardTransactions = this._rewardTxns.asReadonly();

  // ── Phase 1: Campaign seed data (Req 6) ───────────────────────────────────
  private _campaigns = signal<Campaign[]>([
    {
      id: 1, referenceNumber: 'CMP-001',
      name: 'Winter Jacket Drive',
      description: 'Reach donors who have given winter clothing in the past',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      status: CampaignStatus.Draft,
      channel: NotificationChannel.Email,
      targetCriteria: [{ categoryKey: 'clothing', categoryName: 'Clothing', subCategoryKey: 'womens', subCategoryName: "Women's" }],
      notificationHistory: [],
      emailTemplate: {
        channel: NotificationChannel.Email,
        subject: 'Help Us Stock Up on Winter Jackets, {{first_name}}!',
        body: `<p>Hi <strong>{{donor_name}}</strong>,</p>\n<p>As a valued <strong>{{tier}}</strong> member of {{org_name}}, we\'re reaching out to let you know our Winter Jacket Drive is starting soon.</p>\n<p>Your previous clothing donations have made a real difference. We\'d love your help again this year — every jacket counts!</p>\n<p>You currently have <strong>{{points}} points</strong> in your loyalty account. Donate during this campaign to earn bonus points.</p>\n<p>Thank you for your generosity,<br>The {{org_name}} Team</p>`,
        blocks: [
          { id: 's1', type: 'header' as const, content: 'Winter Jacket Drive', align: 'center' as const, level: 1 },
          { id: 's2', type: 'text' as const, content: 'Hi {{donor_name}},\n\nAs a valued {{tier}} member of {{org_name}}, we\'re reaching out to let you know our Winter Jacket Drive is starting soon.', align: 'left' as const },
          { id: 's3', type: 'text' as const, content: 'Your previous clothing donations have made a real difference. We\'d love your help again this year — every jacket counts!', align: 'left' as const },
          { id: 's4', type: 'text' as const, content: 'You currently have {{points}} points in your loyalty account. Donate during this campaign to earn bonus points.', align: 'left' as const },
          { id: 's5', type: 'button' as const, content: 'Learn More', align: 'center' as const, meta: 'https://example.org/jackets' },
          { id: 's6', type: 'divider' as const, content: '', align: 'center' as const },
          { id: 's7', type: 'text' as const, content: 'Thank you for your generosity,\nThe {{org_name}} Team', align: 'left' as const },
        ],
        updatedAt: new Date('2026-03-18'),
      },
      createdAt: new Date('2026-03-18'),
      createdByStaffId: 1,
    },
    {
      id: 2, referenceNumber: 'CMP-002',
      name: 'Electronics Recycling Push',
      description: 'Encourage electronics donors to donate again',
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-03-31'),
      status: CampaignStatus.Active,
      channel: NotificationChannel.Both,
      targetCriteria: [{ categoryKey: 'electronics', categoryName: 'Electronics' }],
      notificationHistory: [
        { donorId: 5, donorName: 'David Chen',       channel: NotificationChannel.Email, sentAt: new Date('2026-03-20'), success: true },
        { donorId: 10, donorName: 'Lisa Anderson',    channel: NotificationChannel.SMS,   sentAt: new Date('2026-03-20'), success: true },
      ],
      emailTemplate: {
        channel: NotificationChannel.Email,
        subject: 'Got Old Electronics? We\'ll Take Them, {{first_name}}!',
        body: `<p>Hi <strong>{{donor_name}}</strong>,</p>\n<p>{{org_name}} is running an Electronics Recycling Push and we thought of you!</p>\n<p>Whether it\'s old phones, laptops, or cables — we\'ll make sure they\'re recycled responsibly.</p>\n<p>Drop off anytime before March 31. As a <strong>{{tier}}</strong> donor with <strong>{{points}} points</strong>, you\'re making a big impact.</p>\n<p>See you soon!<br>{{org_name}}</p>`,
        blocks: [
          { id: 'e1', type: 'header' as const, content: 'Electronics Recycling Push', align: 'center' as const, level: 1 },
          { id: 'e2', type: 'text' as const, content: 'Hi {{donor_name}},\n\n{{org_name}} is running an Electronics Recycling Push and we thought of you!', align: 'left' as const },
          { id: 'e3', type: 'text' as const, content: 'Whether it\'s old phones, laptops, or cables — we\'ll make sure they\'re recycled responsibly.', align: 'left' as const },
          { id: 'e4', type: 'text' as const, content: 'Drop off anytime before March 31. As a {{tier}} donor with {{points}} points, you\'re making a big impact.', align: 'left' as const },
          { id: 'e5', type: 'button' as const, content: 'Find a Drop-off', align: 'center' as const, meta: 'https://example.org/recycle' },
          { id: 'e6', type: 'text' as const, content: 'See you soon!\n{{org_name}}', align: 'left' as const },
        ],
        updatedAt: new Date('2026-03-15'),
      },
      smsTemplate: {
        channel: NotificationChannel.SMS,
        subject: '',
        body: `Hi {{first_name}}! {{org_name}} is collecting electronics thru Mar 31. Drop off old devices & earn bonus points! You have {{points}} pts as a {{tier}} member. Details: example.org/recycle`,
        updatedAt: new Date('2026-03-15'),
      },
      createdAt: new Date('2026-03-15'),
      createdByStaffId: 1,
    },
  ]);
  readonly campaigns = this._campaigns.asReadonly();

  readonly loyaltyTiers: LoyaltyTierConfig[] = [
    {
      tier: DonorTier.Bronze,
      label: 'Bronze',
      icon: 'check-circle',
      minDonations: 1,
      pointsMultiplier: 1,
      color: '#b45309',
      bgColor: '#fef2f2',
      perks: ['Digital receipts', 'Donation history', 'Basic rewards']
    },
    {
      tier: DonorTier.Silver,
      label: 'Silver',
      icon: 'trending-up',
      minDonations: 5,
      pointsMultiplier: 1.5,
      color: '#6b7280',
      bgColor: '#f3f4f6',
      perks: ['All Bronze perks', '1.5× points', 'Priority processing', 'Monthly impact report']
    },
    {
      tier: DonorTier.Gold,
      label: 'Gold',
      icon: 'star',
      minDonations: 10,
      pointsMultiplier: 2,
      color: '#d97706',
      bgColor: '#fef3c7',
      perks: ['All Silver perks', '2× points', 'VIP events', 'Year-end recognition']
    },
    {
      tier: DonorTier.Platinum,
      label: 'Platinum',
      icon: 'gift',
      minDonations: 25,
      pointsMultiplier: 3,
      color: '#7c3aed',
      bgColor: '#ede9fe',
      perks: ['All Gold perks', '3× points', 'Dedicated contact', 'Advisory board invitation']
    }
  ];

  readonly categories: DonationCategory[] = [
    {
      key: 'clothing',
      name: 'Clothing',
      icon: '👔',
      color: '#0066ff',
      estimatedValue: 12,
      active: true,
      sortOrder: 1,
      subCategories: [
        { key: 'womens', name: "Women's", icon: '👗', estimatedValue: 12 },
        { key: 'mens', name: "Men's", icon: '👔', estimatedValue: 12 },
        { key: 'childrens', name: "Children's", icon: '🧒', estimatedValue: 8 }
      ]
    },
    { key: 'shoes', name: 'Shoes', icon: '👟', color: '#10b981', estimatedValue: 15, active: true, sortOrder: 2 },
    {
      key: 'books',
      name: 'Books & Media',
      icon: '📚',
      color: '#f59e0b',
      estimatedValue: 5,
      active: true,
      sortOrder: 3,
      subCategories: [
        { key: 'books', name: 'Books', icon: '📖', estimatedValue: 5 },
        { key: 'dvds', name: 'DVDs/CDs', icon: '💿', estimatedValue: 3 },
        { key: 'games', name: 'Video Games', icon: '🎮', estimatedValue: 15 }
      ]
    },
    {
      key: 'electronics',
      name: 'Electronics',
      icon: '📱',
      color: '#8b5cf6',
      estimatedValue: 50,
      active: true,
      sortOrder: 4,
      subCategories: [
        { key: 'phones', name: 'Phones/Tablets', icon: '📱', estimatedValue: 80 },
        { key: 'appliances', name: 'Appliances', icon: '🔌', estimatedValue: 25 },
        { key: 'cables', name: 'Cables', icon: '🔋', estimatedValue: 5 }
      ]
    },
    {
      key: 'furniture',
      name: 'Furniture',
      icon: '🪑',
      color: '#ef4444',
      estimatedValue: 125,
      active: true,
      sortOrder: 5
    },
    {
      key: 'housewares',
      name: 'Housewares',
      icon: '🍳',
      color: '#06b6d4',
      estimatedValue: 8,
      active: true,
      sortOrder: 6,
      subCategories: [
        { key: 'kitchen', name: 'Kitchen', icon: '🍳', estimatedValue: 8 },
        { key: 'glassware', name: 'Glassware', icon: '🥂', estimatedValue: 6 }
      ]
    },
    {
      key: 'home_decor',
      name: 'Home Décor',
      icon: '🖼️',
      color: '#ec4899',
      estimatedValue: 15,
      active: true,
      sortOrder: 7
    },
    { key: 'toys', name: 'Toys & Games', icon: '🧸', color: '#f97316', estimatedValue: 10, active: true, sortOrder: 8 },
    {
      key: 'linens',
      name: 'Linens & Textiles',
      icon: '🛏️',
      color: '#14b8a6',
      estimatedValue: 7,
      active: true,
      sortOrder: 9
    },
    {
      key: 'accessories',
      name: 'Accessories/Jewelry',
      icon: '👜',
      color: '#a855f7',
      estimatedValue: 20,
      active: true,
      sortOrder: 10
    },
    {
      key: 'sporting',
      name: 'Sporting Goods',
      icon: '⚽',
      color: '#22c55e',
      estimatedValue: 25,
      active: true,
      sortOrder: 11
    },
    {
      key: 'seasonal',
      name: 'Seasonal/Holiday',
      icon: '🎄',
      color: '#dc2626',
      estimatedValue: 12,
      active: true,
      sortOrder: 12
    },
    {
      key: 'salvage',
      name: 'Salvage/Recycling',
      icon: 'refresh',
      color: '#6b7280',
      estimatedValue: 0,
      active: true,
      sortOrder: 13
    }
  ];

  readonly departments: DonationDepartment[] = [
    {
      key: 'clothes',
      name: 'Clothing & Accessories',
      icon: '👔',
      color: '#0066ff',
      estimatedValue: 12,
      active: true,
      sortOrder: 1,
      categories: [
        {
          key: 'clothing', name: 'Clothing', estimatedValue: 12,
          subCategories: [
            { key: 'womens',    name: "Women's",    icon: '👗', estimatedValue: 12 },
            { key: 'mens',      name: "Men's",      icon: '👔', estimatedValue: 12 },
            { key: 'childrens', name: "Children's", icon: '🧒', estimatedValue: 8  }
          ]
        },
        { key: 'shoes',       name: 'Shoes',               estimatedValue: 15 },
        { key: 'accessories', name: 'Accessories/Jewelry',  estimatedValue: 20 }
      ]
    },
    {
      key: 'media',
      name: 'Electronics & Media',
      icon: '📱',
      color: '#8b5cf6',
      estimatedValue: 20,
      active: true,
      sortOrder: 2,
      categories: [
        {
          key: 'electronics', name: 'Electronics', estimatedValue: 50,
          subCategories: [
            { key: 'phones',     name: 'Phones/Tablets', icon: '📱', estimatedValue: 80 },
            { key: 'appliances', name: 'Appliances',      icon: '🔌', estimatedValue: 25 },
            { key: 'cables',     name: 'Cables',          icon: '🔋', estimatedValue: 5  }
          ]
        },
        {
          key: 'books', name: 'Books & Media', estimatedValue: 5,
          subCategories: [
            { key: 'books', name: 'Books',       icon: '📖', estimatedValue: 5  },
            { key: 'dvds',  name: 'DVDs/CDs',    icon: '💿', estimatedValue: 3  },
            { key: 'games', name: 'Video Games', icon: '🎮', estimatedValue: 15 }
          ]
        }
      ]
    },
    {
      key: 'home',
      name: 'Home & Living',
      icon: '🏠',
      color: '#06b6d4',
      estimatedValue: 15,
      active: true,
      sortOrder: 3,
      categories: [
        { key: 'furniture',  name: 'Furniture',         estimatedValue: 125 },
        {
          key: 'housewares', name: 'Housewares', estimatedValue: 8,
          subCategories: [
            { key: 'kitchen',   name: 'Kitchen',    icon: '🍳', estimatedValue: 8 },
            { key: 'glassware', name: 'Glassware',  icon: '🥂', estimatedValue: 6 }
          ]
        },
        { key: 'home_decor', name: 'Home Décor',        estimatedValue: 15 },
        { key: 'linens',     name: 'Linens & Textiles', estimatedValue: 7  }
      ]
    },
    {
      key: 'recreation',
      name: 'Toys & Recreation',
      icon: '🧸',
      color: '#f97316',
      estimatedValue: 10,
      active: true,
      sortOrder: 4,
      categories: [
        { key: 'toys',     name: 'Toys & Games',    estimatedValue: 10 },
        { key: 'sporting', name: 'Sporting Goods',  estimatedValue: 25 },
        { key: 'seasonal', name: 'Seasonal/Holiday', estimatedValue: 12 }
      ]
    },
    {
      key: 'salvage',
      name: 'Salvage & Recycling',
      icon: '♻️',
      color: '#6b7280',
      estimatedValue: 0,
      active: true,
      sortOrder: 5,
      categories: [
        { key: 'salvage', name: 'Salvage/Recycling', estimatedValue: 0 }
      ]
    }
  ];

  readonly locations: Location[] = [
    {
      id: 1, referenceNumber: 'LOC-001',
      name: 'Downtown Store',
      address: '123 Main Street',
      phone: '(555)100-2000',
      managerName: 'Jane Smith',
      staffCount: 5,
      status: LocationStatus.Open,
      hours: 'Mon–Sat 9AM–6PM',
      donationsToday: 15,
      itemsToday: 142,
      revenueToday: 2840
    },
    {
      id: 2, referenceNumber: 'LOC-002',
      name: 'Northside Store',
      address: '456 Oak Avenue',
      phone: '(555)200-3000',
      managerName: 'John Doe',
      staffCount: 4,
      status: LocationStatus.Open,
      hours: 'Mon–Sat 9AM–6PM',
      donationsToday: 12,
      itemsToday: 98,
      revenueToday: 1960
    },
    {
      id: 3, referenceNumber: 'LOC-003',
      name: 'Westside Store',
      address: '789 Pine Road',
      phone: '(555)300-4000',
      managerName: 'Anna Roberts',
      staffCount: 3,
      status: LocationStatus.Busy,
      hours: 'Mon–Fri 10AM–5PM',
      donationsToday: 8,
      itemsToday: 64,
      revenueToday: 1280
    },
    {
      id: 4, referenceNumber: 'LOC-004',
      name: 'Eastside Store',
      address: '321 Elm Boulevard',
      phone: '(555)400-5000',
      managerName: 'Mark Lee',
      staffCount: 2,
      status: LocationStatus.Closed,
      hours: 'Mon–Fri 10AM–5PM (Reduced)',
      donationsToday: 2,
      itemsToday: 18,
      revenueToday: 360
    }
  ];

  readonly donors: Donor[] = [
    {
      id: 1, referenceNumber: 'D-001',
      firstName: 'Michael',
      lastName: 'Johnson',
      email: 'm.johnson@email.com',
      phone: '(555)987-6543',
      address: '123 Main St',
      loyaltyTier: DonorTier.Gold,
      loyaltyPoints: 1240,
      totalDonations: 42,
      lifetimeValue: 8240,
      joinDate: new Date('2022-03-15'),
      lastDonationDate: new Date('2026-03-01')
    },
    {
      id: 2, referenceNumber: 'D-002',
      firstName: 'Sarah',
      lastName: 'Williams',
      email: 's.williams@email.com',
      phone: '(555)234-5678',
      address: '456 Oak Ave',
      loyaltyTier: DonorTier.Gold,
      loyaltyPoints: 890,
      totalDonations: 28,
      lifetimeValue: 5640,
      joinDate: new Date('2022-08-20'),
      lastDonationDate: new Date('2026-02-28')
    },
    {
      id: 3, referenceNumber: 'D-003',
      firstName: 'Robert',
      lastName: 'Martinez',
      email: 'r.martinez@email.com',
      phone: '(555)678-9012',
      address: '789 Pine Rd',
      loyaltyTier: DonorTier.Silver,
      loyaltyPoints: 450,
      totalDonations: 15,
      lifetimeValue: 3120,
      joinDate: new Date('2023-01-10'),
      lastDonationDate: new Date('2026-03-02')
    },
    {
      id: 4, referenceNumber: 'D-004',
      firstName: 'Lisa',
      lastName: 'Park',
      email: 'lisa.p@email.com',
      phone: '(555)345-6789',
      address: '321 Elm Blvd',
      loyaltyTier: DonorTier.Bronze,
      loyaltyPoints: 120,
      totalDonations: 3,
      lifetimeValue: 480,
      joinDate: new Date('2025-11-05'),
      lastDonationDate: new Date('2026-02-10')
    },
    {
      id: 5, referenceNumber: 'D-005',
      firstName: 'David',
      lastName: 'Chen',
      email: 'd.chen@email.com',
      phone: '(555)456-7890',
      address: '555 Maple Dr',
      loyaltyTier: DonorTier.Platinum,
      loyaltyPoints: 4200,
      totalDonations: 67,
      lifetimeValue: 15800,
      joinDate: new Date('2021-06-01'),
      lastDonationDate: new Date('2026-03-10')
    },
    {
      id: 6, referenceNumber: 'D-006',
      firstName: 'Jennifer',
      lastName: 'Taylor',
      email: 'j.taylor@email.com',
      phone: '(555)111-2222',
      address: '111 Cedar Ln',
      loyaltyTier: DonorTier.Gold,
      loyaltyPoints: 1080,
      totalDonations: 38,
      lifetimeValue: 7240,
      joinDate: new Date('2022-05-12'),
      lastDonationDate: new Date('2026-03-05')
    },
    {
      id: 7, referenceNumber: 'D-007',
      firstName: 'James',
      lastName: 'Anderson',
      email: 'j.anderson@email.com',
      phone: '(555)222-3333',
      address: '222 Birch St',
      loyaltyTier: DonorTier.Silver,
      loyaltyPoints: 520,
      totalDonations: 17,
      lifetimeValue: 3420,
      joinDate: new Date('2023-04-08'),
      lastDonationDate: new Date('2026-03-08')
    },
    {
      id: 8, referenceNumber: 'D-008',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'm.garcia@email.com',
      phone: '(555)333-4444',
      address: '333 Spruce Ave',
      loyaltyTier: DonorTier.Bronze,
      loyaltyPoints: 95,
      totalDonations: 2,
      lifetimeValue: 380,
      joinDate: new Date('2026-01-15'),
      lastDonationDate: new Date('2026-02-20')
    },
    {
      id: 9, referenceNumber: 'D-009',
      firstName: 'Thomas',
      lastName: 'Brown',
      email: 't.brown@email.com',
      phone: '(555)444-5555',
      address: '444 Willow Ct',
      loyaltyTier: DonorTier.Platinum,
      loyaltyPoints: 3850,
      totalDonations: 58,
      lifetimeValue: 14200,
      joinDate: new Date('2021-09-20'),
      lastDonationDate: new Date('2026-03-12')
    },
    {
      id: 10, referenceNumber: 'D-010',
      firstName: 'Nancy',
      lastName: 'Wilson',
      email: 'n.wilson@email.com',
      phone: '(555)555-6666',
      address: '555 Ash Rd',
      loyaltyTier: DonorTier.Silver,
      loyaltyPoints: 680,
      totalDonations: 22,
      lifetimeValue: 4420,
      joinDate: new Date('2023-02-14'),
      lastDonationDate: new Date('2026-03-04')
    },
    {
      id: 11, referenceNumber: 'D-011',
      firstName: 'Daniel',
      lastName: 'Moore',
      email: 'd.moore@email.com',
      phone: '(555)666-7777',
      address: '666 Poplar Way',
      loyaltyTier: DonorTier.Gold,
      loyaltyPoints: 1150,
      totalDonations: 40,
      lifetimeValue: 7820,
      joinDate: new Date('2022-07-03'),
      lastDonationDate: new Date('2026-02-25')
    },
    {
      id: 12, referenceNumber: 'D-012',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'e.davis@email.com',
      phone: '(555)777-8888',
      address: '777 Chestnut Pl',
      loyaltyTier: DonorTier.Bronze,
      loyaltyPoints: 145,
      totalDonations: 4,
      lifetimeValue: 620,
      joinDate: new Date('2025-10-22'),
      lastDonationDate: new Date('2026-03-11')
    },
    {
      id: 13, referenceNumber: 'D-013',
      firstName: 'Kevin',
      lastName: 'Miller',
      email: 'k.miller@email.com',
      phone: '(555)888-9999',
      address: '888 Hickory Ln',
      loyaltyTier: DonorTier.Silver,
      loyaltyPoints: 490,
      totalDonations: 16,
      lifetimeValue: 3220,
      joinDate: new Date('2023-06-18'),
      lastDonationDate: new Date('2026-03-09')
    },
    {
      id: 14, referenceNumber: 'D-014',
      firstName: 'Rebecca',
      lastName: 'White',
      email: 'r.white@email.com',
      phone: '(555)999-0000',
      address: '999 Sycamore Dr',
      loyaltyTier: DonorTier.Platinum,
      loyaltyPoints: 4650,
      totalDonations: 72,
      lifetimeValue: 16840,
      joinDate: new Date('2021-04-10'),
      lastDonationDate: new Date('2026-03-13')
    },
    {
      id: 15, referenceNumber: 'D-015',
      firstName: 'Chris',
      lastName: 'Thompson',
      email: 'c.thompson@email.com',
      phone: '(555)101-1010',
      address: '101 Magnolia Blvd',
      loyaltyTier: DonorTier.Gold,
      loyaltyPoints: 980,
      totalDonations: 32,
      lifetimeValue: 6240,
      joinDate: new Date('2022-11-05'),
      lastDonationDate: new Date('2026-03-07')
    }
  ];

  readonly donations: Donation[] = [
    {
      id: 1, referenceNumber: 'DON-001',
      receiptNumber: 'DN-001234',
      donorId: 1,
      donorName: 'Michael Johnson',
      donorInitials: 'MJ',
      donorTier: DonorTier.Gold,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-15T14:45:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 1, referenceNumber: 'ITEM-001',
          donationId: 1,
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 8,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 96
        },
        {
          id: 2, referenceNumber: 'ITEM-002',
          donationId: 1,
          categoryKey: 'books',
          categoryName: 'Books',
          quantity: 5,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 25
        },
        {
          id: 3, referenceNumber: 'ITEM-003',
          donationId: 1,
          categoryKey: 'housewares',
          categoryName: 'Housewares',
          quantity: 2,
          estimatedValuePerItem: 8,
          totalEstimatedValue: 16
        }
      ],
      totalItems: 15,
      totalEstimatedValue: 137,
      loyaltyPointsEarned: 27,
      presortCompleted: true
    },
    {
      id: 2, referenceNumber: 'DON-002',
      receiptNumber: 'DN-001233',
      donorId: 2,
      donorName: 'Sarah Williams',
      donorInitials: 'SW',
      donorTier: DonorTier.Gold,
      locationId: 2,
      locationName: 'Northside Store',
      attendantId: 2,
      timestamp: new Date('2026-03-15T14:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 4, referenceNumber: 'ITEM-004',
          donationId: 2,
          categoryKey: 'shoes',
          categoryName: 'Shoes',
          quantity: 4,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 60
        },
        {
          id: 5, referenceNumber: 'ITEM-005',
          donationId: 2,
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 4,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 48
        }
      ],
      totalItems: 8,
      totalEstimatedValue: 108,
      loyaltyPointsEarned: 22,
      presortCompleted: true
    },
    {
      id: 3, referenceNumber: 'DON-003',
      receiptNumber: 'DN-001232',
      donorId: 3,
      donorName: 'Robert Martinez',
      donorInitials: 'RM',
      donorTier: DonorTier.Silver,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-15T14:15:00'),
      status: DonationStatus.CheckedIn,
      items: [
        {
          id: 6, referenceNumber: 'ITEM-006',
          donationId: 3,
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 2,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 250
        },
        {
          id: 7, referenceNumber: 'ITEM-007',
          donationId: 3,
          categoryKey: 'home_decor',
          categoryName: 'Home Décor',
          quantity: 8,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 120
        }
      ],
      totalItems: 10,
      totalEstimatedValue: 370,
      loyaltyPointsEarned: 74,
      presortCompleted: false
    },
    {
      id: 4, referenceNumber: 'DON-004',
      receiptNumber: 'DN-001231',
      donorId: 4,
      donorName: 'Lisa Park',
      donorInitials: 'LP',
      donorTier: DonorTier.Bronze,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-14T10:20:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 8, referenceNumber: 'ITEM-008',
          donationId: 4,
          categoryKey: 'books',
          categoryName: 'Books & Media',
          quantity: 12,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 60
        }
      ],
      totalItems: 12,
      totalEstimatedValue: 60,
      loyaltyPointsEarned: 12,
      presortCompleted: true
    },
    {
      id: 5, referenceNumber: 'DON-005',
      receiptNumber: 'DN-001230',
      donorId: 5,
      donorName: 'David Chen',
      donorInitials: 'DC',
      donorTier: DonorTier.Platinum,
      locationId: 2,
      locationName: 'Northside Store',
      attendantId: 2,
      timestamp: new Date('2026-03-13T15:50:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 9, referenceNumber: 'ITEM-009',
          donationId: 5,
          categoryKey: 'electronics',
          categoryName: 'Electronics',
          quantity: 3,
          estimatedValuePerItem: 50,
          totalEstimatedValue: 150
        },
        {
          id: 10, referenceNumber: 'ITEM-010',
          donationId: 5,
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 10,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 120
        }
      ],
      totalItems: 13,
      totalEstimatedValue: 270,
      loyaltyPointsEarned: 81,
      presortCompleted: true
    },
    {
      id: 6, referenceNumber: 'DON-006',
      receiptNumber: 'DN-001229',
      donorId: 6,
      donorName: 'Jennifer Taylor',
      donorInitials: 'JT',
      donorTier: DonorTier.Gold,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-12T11:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 11, referenceNumber: 'ITEM-011',
          donationId: 6,
          categoryKey: 'toys',
          categoryName: 'Toys & Games',
          quantity: 8,
          estimatedValuePerItem: 10,
          totalEstimatedValue: 80
        },
        {
          id: 12, referenceNumber: 'ITEM-012',
          donationId: 6,
          categoryKey: 'home_decor',
          categoryName: 'Home Décor',
          quantity: 5,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 75
        },
        {
          id: 13, referenceNumber: 'ITEM-013',
          donationId: 6,
          categoryKey: 'linens',
          categoryName: 'Linens & Textiles',
          quantity: 4,
          estimatedValuePerItem: 7,
          totalEstimatedValue: 28
        }
      ],
      totalItems: 17,
      totalEstimatedValue: 183,
      loyaltyPointsEarned: 37,
      presortCompleted: true
    },
    {
      id: 7, referenceNumber: 'DON-007',
      receiptNumber: 'DN-001228',
      donorId: 7,
      donorName: 'James Anderson',
      donorInitials: 'JA',
      donorTier: DonorTier.Silver,
      locationId: 3,
      locationName: 'Westside Store',
      attendantId: 3,
      timestamp: new Date('2026-03-11T09:15:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 14, referenceNumber: 'ITEM-014',
          donationId: 7,
          categoryKey: 'sporting',
          categoryName: 'Sporting Goods',
          quantity: 6,
          estimatedValuePerItem: 25,
          totalEstimatedValue: 150
        },
        {
          id: 15, referenceNumber: 'ITEM-015',
          donationId: 7,
          categoryKey: 'shoes',
          categoryName: 'Shoes',
          quantity: 3,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 45
        }
      ],
      totalItems: 9,
      totalEstimatedValue: 195,
      loyaltyPointsEarned: 39,
      presortCompleted: true
    },
    {
      id: 8, referenceNumber: 'DON-008',
      receiptNumber: 'DN-001227',
      donorId: 9,
      donorName: 'Thomas Brown',
      donorInitials: 'TB',
      donorTier: DonorTier.Platinum,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-10T13:40:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 16, referenceNumber: 'ITEM-016',
          donationId: 8,
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 1,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 125
        },
        {
          id: 17, referenceNumber: 'ITEM-017',
          donationId: 8,
          categoryKey: 'housewares',
          categoryName: 'Housewares',
          quantity: 15,
          estimatedValuePerItem: 8,
          totalEstimatedValue: 120
        },
        {
          id: 18, referenceNumber: 'ITEM-018',
          donationId: 8,
          categoryKey: 'accessories',
          categoryName: 'Accessories',
          quantity: 10,
          estimatedValuePerItem: 20,
          totalEstimatedValue: 200
        }
      ],
      totalItems: 26,
      totalEstimatedValue: 445,
      loyaltyPointsEarned: 134,
      presortCompleted: true
    },
    {
      id: 9, referenceNumber: 'DON-009',
      receiptNumber: 'DN-001226',
      donorId: 10,
      donorName: 'Nancy Wilson',
      donorInitials: 'NW',
      donorTier: DonorTier.Silver,
      locationId: 2,
      locationName: 'Northside Store',
      attendantId: 2,
      timestamp: new Date('2026-03-09T16:20:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 19, referenceNumber: 'ITEM-019',
          donationId: 9,
          categoryKey: 'books',
          categoryName: 'Books & Media',
          quantity: 20,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 100
        },
        {
          id: 20, referenceNumber: 'ITEM-020',
          donationId: 9,
          categoryKey: 'seasonal',
          categoryName: 'Seasonal',
          quantity: 8,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 96
        }
      ],
      totalItems: 28,
      totalEstimatedValue: 196,
      loyaltyPointsEarned: 39,
      presortCompleted: true
    },
    {
      id: 10, referenceNumber: 'DON-010',
      receiptNumber: 'DN-001225',
      donorId: 11,
      donorName: 'Daniel Moore',
      donorInitials: 'DM',
      donorTier: DonorTier.Gold,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-08T10:00:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 21, referenceNumber: 'ITEM-021',
          donationId: 10,
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 15,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 180
        },
        {
          id: 22, referenceNumber: 'ITEM-022',
          donationId: 10,
          categoryKey: 'electronics',
          categoryName: 'Electronics',
          quantity: 2,
          estimatedValuePerItem: 50,
          totalEstimatedValue: 100
        }
      ],
      totalItems: 17,
      totalEstimatedValue: 280,
      loyaltyPointsEarned: 56,
      presortCompleted: true
    },
    {
      id: 11, referenceNumber: 'DON-011',
      receiptNumber: 'DN-001224',
      donorId: 1,
      donorName: 'Michael Johnson',
      donorInitials: 'MJ',
      donorTier: DonorTier.Gold,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-03-01T14:25:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 23, referenceNumber: 'ITEM-023',
          donationId: 11,
          categoryKey: 'books',
          categoryName: 'Books & Media',
          quantity: 8,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 40
        },
        {
          id: 24, referenceNumber: 'ITEM-024',
          donationId: 11,
          categoryKey: 'housewares',
          categoryName: 'Housewares',
          quantity: 6,
          estimatedValuePerItem: 8,
          totalEstimatedValue: 48
        },
        {
          id: 25, referenceNumber: 'ITEM-025',
          donationId: 11,
          categoryKey: 'linens',
          categoryName: 'Linens',
          quantity: 10,
          estimatedValuePerItem: 7,
          totalEstimatedValue: 70
        }
      ],
      totalItems: 24,
      totalEstimatedValue: 158,
      loyaltyPointsEarned: 32,
      presortCompleted: true
    },
    {
      id: 12, referenceNumber: 'DON-012',
      receiptNumber: 'DN-001223',
      donorId: 2,
      donorName: 'Sarah Williams',
      donorInitials: 'SW',
      donorTier: DonorTier.Gold,
      locationId: 2,
      locationName: 'Northside Store',
      attendantId: 2,
      timestamp: new Date('2026-02-28T11:10:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 26, referenceNumber: 'ITEM-026',
          donationId: 12,
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 12,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 144
        }
      ],
      totalItems: 12,
      totalEstimatedValue: 144,
      loyaltyPointsEarned: 29,
      presortCompleted: true
    },
    {
      id: 13, referenceNumber: 'DON-013',
      receiptNumber: 'DN-001222',
      donorId: 14,
      donorName: 'Rebecca White',
      donorInitials: 'RW',
      donorTier: DonorTier.Platinum,
      locationId: 1,
      locationName: 'Downtown Store',
      attendantId: 1,
      timestamp: new Date('2026-02-25T15:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 27, referenceNumber: 'ITEM-027',
          donationId: 13,
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 2,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 250
        },
        {
          id: 28, referenceNumber: 'ITEM-028',
          donationId: 13,
          categoryKey: 'electronics',
          categoryName: 'Electronics',
          quantity: 4,
          estimatedValuePerItem: 50,
          totalEstimatedValue: 200
        },
        {
          id: 29, referenceNumber: 'ITEM-029',
          donationId: 13,
          categoryKey: 'home_decor',
          categoryName: 'Home Décor',
          quantity: 6,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 90
        }
      ],
      totalItems: 12,
      totalEstimatedValue: 540,
      loyaltyPointsEarned: 162,
      presortCompleted: true
    }
  ];

  readonly containers: Container[] = [
    {
      id: 1, referenceNumber: 'C-001',
      barcode: 'BRJ-2026-001234',
      donationId: 1,
      donationReceiptNumber: 'DN-001234',
      donorVisitLabel: 'Michael Johnson',
      containerType: ContainerType.Gaylord,
      presortMethod: PresortMethod.Batch,
      presortWorkerName: 'Tom Wilson',
      deptKey: 'clothes', deptName: 'Clothing & Accessories',
      catKey: 'clothing', catName: 'Clothing',
      contents: [
        { categoryKey: 'clothing', categoryName: 'Clothing', quantity: 28, condition: ItemCondition.Sellable },
        { categoryKey: 'shoes', categoryName: 'Shoes', quantity: 12, condition: ItemCondition.Sellable }
      ],
      destination: ContainerDest.Production,
      status: ContainerStatus.Sorting,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T07:10:00'),
      updatedAt: new Date('2026-03-16T08:30:00'),
      presortedAt: new Date('2026-03-16T08:30:00'),
      totalItems: 40, totalEstimatedValue: 516
    },
    {
      id: 2, referenceNumber: 'C-002',
      barcode: 'BRJ-2026-001235',
      donationId: 2,
      donationReceiptNumber: 'DN-001233',
      donorVisitLabel: 'Sarah Williams',
      containerType: ContainerType.CartRack,
      presortMethod: PresortMethod.Batch,
      deptKey: 'media', deptName: 'Electronics & Media',
      catKey: 'books', catName: 'Books & Media',
      contents: [
        { categoryKey: 'books', categoryName: 'Books & Media', quantity: 45, condition: ItemCondition.Sellable },
        { categoryKey: 'toys', categoryName: 'Toys & Games', quantity: 18, condition: ItemCondition.Sellable }
      ],
      destination: ContainerDest.Production,
      status: ContainerStatus.InUse,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T06:00:00'),
      updatedAt: new Date('2026-03-16T10:00:00'),
      presortedAt: new Date('2026-03-16T09:00:00'),
      totalItems: 63, totalEstimatedValue: 405
    },
    {
      id: 3, referenceNumber: 'C-003',
      barcode: 'BRJ-2026-001236',
      donationId: 3,
      donationReceiptNumber: 'DN-001232',
      donorVisitLabel: 'Walk-in Drop',
      containerType: ContainerType.Gaylord,
      presortMethod: PresortMethod.DockSide,
      deptKey: 'clothes', deptName: 'Clothing & Accessories',
      contents: [{ categoryKey: 'clothing', categoryName: 'Clothing', quantity: 50, condition: ItemCondition.Sellable }],
      destination: ContainerDest.Warehouse,
      status: ContainerStatus.Available,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T11:00:00'),
      updatedAt: new Date('2026-03-16T11:00:00'),
      totalItems: 50, totalEstimatedValue: 600
    },
    {
      id: 4, referenceNumber: 'C-004',
      barcode: 'BRJ-2026-001237',
      donationId: 5,
      donationReceiptNumber: 'DN-001230',
      donorVisitLabel: 'David Chen',
      containerType: ContainerType.Tote,
      presortMethod: PresortMethod.DockSide,
      deptKey: 'media', deptName: 'Electronics & Media',
      catKey: 'electronics', catName: 'Electronics',
      contents: [
        { categoryKey: 'electronics', categoryName: 'Electronics', quantity: 8, condition: ItemCondition.NeedsRefurbishment, ecommerceQty: 3 }
      ],
      destination: ContainerDest.Ecommerce,
      status: ContainerStatus.Sorting,
      locationId: 2, locationName: 'Northside Store',
      createdAt: new Date('2026-03-15T16:00:00'),
      updatedAt: new Date('2026-03-15T17:00:00'),
      presortedAt: new Date('2026-03-15T17:00:00'),
      totalItems: 8, totalEstimatedValue: 400
    },
    {
      id: 5, referenceNumber: 'C-005',
      barcode: 'BRJ-2026-001238',
      containerType: ContainerType.Pallet,
      deptKey: 'home', deptName: 'Home & Living',
      catKey: 'furniture', catName: 'Furniture',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T13:30:00'),
      updatedAt: new Date('2026-03-16T13:30:00'),
      totalItems: 0, totalEstimatedValue: 0
    },
    {
      id: 6, referenceNumber: 'C-006',
      barcode: 'BRJ-2026-001239',
      containerType: ContainerType.Baler,
      deptKey: 'salvage', deptName: 'Salvage & Recycling',
      catKey: 'salvage', catName: 'Salvage/Recycling',
      contents: [],
      destination: ContainerDest.Salvage,
      status: ContainerStatus.Available,
      salvageWeightLbs: 120,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T09:00:00'),
      updatedAt: new Date('2026-03-16T09:00:00'),
      totalItems: 0, totalEstimatedValue: 0,
      notes: 'Textile bale — scheduled for pickup'
    },
    {
      id: 7, referenceNumber: 'C-007',
      barcode: 'BRJ-2026-001240',
      donorVisitLabel: 'Walk-in Drop (Anonymous)',
      containerType: ContainerType.Gaylord,
      presortMethod: PresortMethod.Batch,
      deptKey: 'clothes', deptName: 'Clothing & Accessories',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date(Date.now() - 78 * 60 * 1000),
      updatedAt: new Date(Date.now() - 78 * 60 * 1000),
      totalItems: 65, totalEstimatedValue: 0
    },
    {
      id: 8, referenceNumber: 'C-008',
      barcode: 'BRJ-2026-001241',
      donationReceiptNumber: 'DN-001237',
      donorVisitLabel: 'Robert Martinez · DN-001237',
      containerType: ContainerType.Pallet,
      presortMethod: PresortMethod.Batch,
      deptKey: 'home', deptName: 'Home & Living',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 1, locationName: 'Downtown Store',
      createdAt: new Date(Date.now() - 95 * 60 * 1000),
      updatedAt: new Date(Date.now() - 95 * 60 * 1000),
      totalItems: 110, totalEstimatedValue: 0
    }
  ];

  readonly analytics: AnalyticsSummary = {
    totalDonations: 1847,
    totalValue: 124000,
    activeDonors: 3421,
    avgProcessTimeMin: 4.2,
    newDonorsThisMonth: 89,
    repeatDonorRate: 72,
    monetaryDonationVolume: 18400,
    identificationRate: 68,
    trends: [
      { label: 'Apr', count: 320, value: 38400 },
      { label: 'May', count: 410, value: 49200 },
      { label: 'Jun', count: 380, value: 45600 },
      { label: 'Jul', count: 290, value: 34800 },
      { label: 'Aug', count: 440, value: 52800 },
      { label: 'Sep', count: 520, value: 62400 },
      { label: 'Oct', count: 480, value: 57600 },
      { label: 'Nov', count: 600, value: 72000 },
      { label: 'Dec', count: 550, value: 66000 },
      { label: 'Jan', count: 390, value: 46800 },
      { label: 'Feb', count: 470, value: 56400 },
      { label: 'Mar', count: 624, value: 74880 }
    ],
    categoryBreakdown: [
      { categoryKey: 'clothing', categoryName: 'Clothing', color: '#0066ff', count: 187, percentage: 30 },
      { categoryKey: 'books', categoryName: 'Books', color: '#10b981', count: 125, percentage: 20 },
      { categoryKey: 'electronics', categoryName: 'Electronics', color: '#f59e0b', count: 94, percentage: 15 },
      { categoryKey: 'furniture', categoryName: 'Furniture', color: '#8b5cf6', count: 62, percentage: 10 },
      { categoryKey: 'other', categoryName: 'Other', color: '#ef4444', count: 156, percentage: 25 }
    ],
    topLocations: [
      { locationId: 1, locationName: 'Downtown Store', totalValue: 7420, percentage: 100 },
      { locationId: 2, locationName: 'Northside Store', totalValue: 5890, percentage: 79 },
      { locationId: 3, locationName: 'Westside Store', totalValue: 3240, percentage: 44 },
      { locationId: 4, locationName: 'Eastside Store', totalValue: 1850, percentage: 25 }
    ]
  };

  /** Live presort queue — derived from containers with status 'ready_for_sorting' */
  get presortQueue(): PresortQueueItem[] {
    return this.containers
      .filter(c => c.status === ContainerStatus.ReadyForSorting)
      .map(c => ({
        id: c.id,
        barcode: c.barcode,
        donationReceiptNumber: c.donationReceiptNumber,
        donorVisitLabel: c.donorVisitLabel ?? c.barcode,
        containerType: c.containerType,
        presortMethod: c.presortMethod ?? PresortMethod.Batch,
        itemCount: c.totalItems,
        receivedAt: c.createdAt
      }));
  }

  /** Compute today's presort stats from the containers array */
  getPresortStats(): {
    sortedToday: number;
    itemsProcessed: number;
    avgSortMinutes: number;
    salvageRate: number;
    ecommerceItems: number;
    oldestQueuedMins: number;
    deptVolume: { name: string; pct: number; color: string }[];
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sorted = this.containers.filter(
      c => c.status !== ContainerStatus.Available && c.status !== ContainerStatus.ReadyForSorting && c.presortedAt && c.presortedAt >= today
    );
    const itemsProcessed = sorted.reduce((s, c) => s + c.totalItems, 0);
    const avgSortMinutes =
      sorted.length > 0
        ? sorted.reduce((s, c) => {
            const mins = c.presortedAt
              ? Math.round((c.presortedAt.getTime() - c.createdAt.getTime()) / 60000)
              : 10;
            return s + mins;
          }, 0) / sorted.length
        : 0;
    const totalItems = this.containers.reduce((s, c) => s + c.totalItems, 0);
    const salvageItems = this.containers.reduce(
      (s, c) => s + c.contents.filter(x => x.condition === ItemCondition.Salvage || x.condition === ItemCondition.Dispose).reduce((a, x) => a + x.quantity, 0),
      0
    );
    const ecommerceItems = this.containers.reduce(
      (s, c) => s + c.contents.reduce((a, x) => a + (x.ecommerceQty ?? 0), 0),
      0
    );
    const oldestQueuedMins = this.presortQueue.length > 0
      ? Math.max(...this.presortQueue.map(q => Math.floor((Date.now() - q.receivedAt.getTime()) / 60000)))
      : 0;

    // dept volume from containers contents
    const deptMap = new Map<string, { name: string; qty: number; color: string }>();
    for (const c of this.containers) {
      for (const ct of c.contents) {
        const cat = this.categories.find(x => x.key === ct.categoryKey);
        const existing = deptMap.get(ct.categoryKey);
        if (existing) {
          existing.qty += ct.quantity;
        } else {
          deptMap.set(ct.categoryKey, { name: ct.categoryName, qty: ct.quantity, color: cat?.color ?? '#94a3b8' });
        }
      }
    }
    const allQty = [...deptMap.values()].reduce((s, v) => s + v.qty, 0) || 1;
    const deptVolume = [...deptMap.entries()]
      .map(([, v]) => ({ name: v.name, pct: Math.round((v.qty / allQty) * 100), color: v.color }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5);

    return {
      sortedToday: sorted.length,
      itemsProcessed,
      avgSortMinutes: Math.round(avgSortMinutes * 10) / 10,
      salvageRate: totalItems > 0 ? Math.round((salvageItems / totalItems) * 1000) / 10 : 0,
      ecommerceItems,
      oldestQueuedMins,
      deptVolume
    };
  }

  getTier(tier: DonorTier): LoyaltyTierConfig {
    return this.loyaltyTiers.find(t => t.tier === tier) ?? this.loyaltyTiers[0];
  }

  getInitials(first: string, last: string): string {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }

  newReceipt(): string {
    return `DN-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
  }

  newBarcode(): string {
    return `BRJ-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`;
  }

  // ─── Helper Methods ───

  getDonorById(id: number): Donor | undefined {
    return this.donors.find(d => d.id === id);
  }

  getDonationsByDonor(donorId: number): Donation[] {
    return this.donations
      .filter(d => d.donorId === donorId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getContainersByLocation(locationId: number): Container[] {
    return this.containers.filter(c => c.locationId === locationId);
  }

  getDonationById(id: number): Donation | undefined {
    return this.donations.find(d => d.id === id);
  }

  getLocationById(id: number): Location | undefined {
    return this.locations.find(l => l.id === id);
  }

  getCategoryByKey(key: string): DonationCategory | undefined {
    return this.categories.find(c => c.key === key);
  }

  // Simulated creation methods (would be API calls in production)
  createDonation(donation: Partial<Donation>): Donation {
    const newDonation: Donation = {
      id: Date.now(),
      referenceNumber: `DON-${Date.now()}`,
      receiptNumber: this.newReceipt(),
      donorId: donation.donorId || undefined,
      donorName: donation.donorName || 'Anonymous',
      donorInitials: donation.donorInitials || 'AN',
      donorTier: donation.donorTier || undefined,
      locationId: donation.locationId || this.session.locationId,
      locationName: donation.locationName || this.session.locationName,
      attendantId: donation.attendantId || this.session.staffId,
      timestamp: new Date(),
      status: DonationStatus.Completed,
      items: donation.items || [],
      totalItems: donation.totalItems || 0,
      totalEstimatedValue: donation.totalEstimatedValue || 0,
      loyaltyPointsEarned: donation.loyaltyPointsEarned,
      presortCompleted: false
    };
    this.donations.unshift(newDonation);
    this.storage.saveDonations(this.donations);
    return newDonation;
  }

  updateDonation(id: number, updates: Partial<Donation>): Donation | undefined {
    const index = this.donations.findIndex(d => d.id === id);
    if (index >= 0) {
      this.donations[index] = { ...this.donations[index], ...updates };
      this.storage.saveDonations(this.donations);
      return this.donations[index];
    }
    return undefined;
  }

  createContainer(container: Partial<Container>): Container {
    const newContainer: Container = {
      id: Date.now(),
      referenceNumber: `C-${Date.now()}`,
      barcode: container.barcode ?? this.newBarcode(),
      donationId: container.donationId,
      donationReceiptNumber: container.donationReceiptNumber,
      donorVisitLabel: container.donorVisitLabel,
      presortWorkerName: container.presortWorkerName,
      containerType: container.containerType ?? ContainerType.Gaylord,
      presortMethod: container.presortMethod,
      deptKey: container.deptKey,
      deptName: container.deptName,
      catKey: container.catKey,
      catName: container.catName,
      contents: container.contents || [],
      destination: container.destination,
      status: container.status ?? ContainerStatus.Available,
      locationId: container.locationId || this.session.locationId,
      locationName: container.locationName || this.session.locationName,
      createdAt: new Date(),
      updatedAt: new Date(),
      presortedAt: container.status !== ContainerStatus.Available ? new Date() : undefined,
      totalItems: container.totalItems || 0,
      totalEstimatedValue: 0,
      salvageWeightLbs: container.salvageWeightLbs,
      isSeasonal: container.isSeasonal,
      seasonalTag: container.seasonalTag,
      parentContainerId: container.parentContainerId,
      notes: container.notes,
      closedAt: container.closedAt,
      transferToLocationId: container.transferToLocationId,
      transferToLocationName: container.transferToLocationName,
      mergedContainerIds: container.mergedContainerIds
    };
    this.containers.unshift(newContainer);
    this.storage.saveContainers(this.containers);
    return newContainer;
  }

  updateContainer(id: number, updates: Partial<Container>): Container | undefined {
    const index = this.containers.findIndex(c => c.id === id);
    if (index >= 0) {
      this.containers[index] = { ...this.containers[index], ...updates, updatedAt: new Date() };
      this.storage.saveContainers(this.containers);
      return this.containers[index];
    }
    return undefined;
  }

  updateDonor(id: number, patch: Partial<Donor>): void {
    const index = this.donors.findIndex(d => d.id === id);
    if (index >= 0) {
      (this.donors as Donor[])[index] = { ...this.donors[index], ...patch };
    }
  }

  addDonor(donor: Omit<Donor, 'id' | 'referenceNumber' | 'joinDate' | 'totalDonations' | 'lifetimeValue' | 'loyaltyPoints' | 'loyaltyTier'>): Donor {
    const newDonor: Donor = {
      ...donor,
      id: Date.now(),
      referenceNumber: `D-${Date.now()}`,
      joinDate: new Date(),
      totalDonations: 0,
      lifetimeValue: 0,
      loyaltyPoints: 0,
      loyaltyTier: DonorTier.Bronze,
    };
    (this.donors as Donor[]).unshift(newDonor);
    return newDonor;
  }

  // Simulated rewards/points
  getAvailableRewards() {
    return [
      { id: 1, referenceNumber: 'R-001', name: '$5 Gift Card', pointsRequired: 500, icon: '💳', category: 'gift-card' },
      { id: 2, referenceNumber: 'R-002', name: '$10 Gift Card', pointsRequired: 1000, icon: '💳', category: 'gift-card' },
      { id: 3, referenceNumber: 'R-003', name: '$25 Gift Card', pointsRequired: 2500, icon: '💳', category: 'gift-card' },
      { id: 4, referenceNumber: 'R-004', name: 'Free Pickup Service', pointsRequired: 300, icon: '🚚', category: 'service' },
      { id: 5, referenceNumber: 'R-005', name: 'Priority Processing', pointsRequired: 150, icon: '⚡', category: 'service' },
      { id: 6, referenceNumber: 'R-006', name: 'Thank You Mug', pointsRequired: 800, icon: '☕', category: 'merchandise' },
      { id: 7, referenceNumber: 'R-007', name: 'Tote Bag', pointsRequired: 600, icon: '👜', category: 'merchandise' },
      { id: 8, referenceNumber: 'R-008', name: 'Branded T-Shirt', pointsRequired: 1200, icon: '👕', category: 'merchandise' }
    ];
  }

  getScheduledPickups(donorId?: number) {
    return this.getScheduledDonations(donorId);
  }

  getScheduledDonations(donorId?: number): import('../models/domain.models').ScheduledDonation[] {
    const appts: import('../models/domain.models').ScheduledDonation[] = [
      {
        id: 1,
        referenceNumber: 'APT-20260320-001',
        donorId: 1,
        donorName: 'Michael Johnson',
        donorPhone: '(555) 101-2020',
        donorEmail: 'michael.j@email.com',
        address: '123 Main St, Springfield',
        locationId: 1,
        locationName: 'Downtown Store',
        method: DonationMethod.Scheduled,
        date: new Date('2026-03-20'),
        timeSlot: '9:00 AM',
        status: DonationStatus.Scheduled,
        itemCount: 12,
        categories: ['Furniture', 'Home Décor'],
        recurring: 'One-time',
        notes: 'Large furniture items — needs loading dock',
        createdAt: new Date('2026-03-12')
      },
      {
        id: 2,
        referenceNumber: 'APT-20260322-002',
        donorId: 2,
        donorName: 'Sarah Williams',
        donorPhone: '(555) 234-5678',
        donorEmail: 'sarah.w@email.com',
        address: '456 Oak Ave, Springfield',
        locationId: 1,
        locationName: 'Downtown Store',
        method: DonationMethod.Scheduled,
        date: new Date('2026-03-22'),
        timeSlot: '1:00 PM',
        status: DonationStatus.Scheduled,
        itemCount: 8,
        categories: ['Clothing', 'Shoes'],
        recurring: 'Monthly',
        notes: 'Clothing boxes — approx 8 boxes',
        createdAt: new Date('2026-03-14')
      },
      {
        id: 3,
        referenceNumber: 'APT-20260318-003',
        donorId: 5,
        donorName: 'David Chen',
        donorPhone: '(555) 555-9900',
        donorEmail: 'david.c@email.com',
        address: '555 Maple Dr, Springfield',
        locationId: 2,
        locationName: 'Westside Thrift',
        method: DonationMethod.Scheduled,
        date: new Date('2026-03-18'),
        timeSlot: '9:00 AM',
        status: DonationStatus.Completed,
        itemCount: 5,
        categories: ['Electronics', 'Books'],
        recurring: 'One-time',
        notes: 'Electronics and books',
        createdAt: new Date('2026-03-10')
      },
      {
        id: 4,
        referenceNumber: 'APT-20260325-004',
        donorId: 6,
        donorName: 'Jennifer Taylor',
        donorPhone: '(555) 321-6543',
        donorEmail: 'jen.t@email.com',
        address: '111 Cedar Ln, Springfield',
        locationId: 1,
        locationName: 'Downtown Store',
        method: DonationMethod.Scheduled,
        date: new Date('2026-03-25'),
        timeSlot: '2:00 PM',
        status: DonationStatus.Scheduled,
        itemCount: 20,
        categories: ['Books', 'Home Décor', 'Toys & Games'],
        recurring: 'One-time',
        notes: 'Books and home decor',
        createdAt: new Date('2026-03-15')
      },
      {
        id: 5,
        referenceNumber: 'APT-20260319-005',
        donorId: 9,
        donorName: 'Thomas Brown',
        donorPhone: '(555) 777-1234',
        donorEmail: 'thomas.b@email.com',
        address: '444 Willow Ct, Springfield',
        locationId: 3,
        locationName: 'Eastside Thrift',
        method: DonationMethod.Scheduled,
        date: new Date('2026-03-19'),
        timeSlot: '10:00 AM',
        status: DonationStatus.Cancelled,
        itemCount: 3,
        categories: ['Clothing'],
        recurring: 'One-time',
        notes: 'Cancelled by donor',
        createdAt: new Date('2026-03-11')
      },
      {
        id: 6,
        referenceNumber: 'APT-20260328-006',
        donorName: 'Anonymous',
        locationId: 2,
        locationName: 'Westside Thrift',
        method: DonationMethod.WalkIn,
        date: new Date('2026-03-28'),
        timeSlot: '11:00 AM',
        status: DonationStatus.Scheduled,
        itemCount: 6,
        categories: ['Clothing', 'Shoes'],
        recurring: 'One-time',
        notes: 'Walk-in scheduled by phone',
        createdAt: new Date('2026-03-16')
      },
      {
        id: 7,
        referenceNumber: 'APT-20260401-007',
        donorId: 3,
        donorName: 'Robert Martinez',
        donorPhone: '(555) 456-7890',
        donorEmail: 'roberto.m@email.com',
        address: '789 Elm St, Springfield',
        locationId: 1,
        locationName: 'Downtown Store',
        method: DonationMethod.Scheduled,
        date: new Date('2026-04-01'),
        timeSlot: '3:00 PM',
        status: DonationStatus.Scheduled,
        itemCount: 15,
        categories: ['Furniture', 'Clothing', 'Electronics'],
        recurring: 'Every 2 Weeks',
        notes: 'Regular donor — gold tier',
        createdAt: new Date('2026-03-16')
      }
    ];
    return donorId ? appts.filter(a => a.donorId === donorId) : appts;
  }

  createPickup(pickup: any) {
    // Simulate creating a pickup
    return {
      id: Date.now(),
      ...pickup,
      status: DonationStatus.Scheduled,
      createdAt: new Date()
    };
  }

  // ── Phase 1: Loyalty point calculation (Req 4) ────────────────────────────

  calculatePoints(itemCount: number): number {
    return itemCount * this.appConfig().pointsPerItem;
  }

  // ── Phase 1: Donor association (Req 1) ────────────────────────────────────

  /**
   * Returns true if the donation is eligible for donor association:
   * - status is Completed
   * - has no existing donorId or associatedDonorId
   * - within the configurable window
   */
  canAssociateDonor(donation: Donation): boolean {
    if (donation.status !== DonationStatus.Completed) return false;
    if (donation.donorId || donation.associatedDonorId)  return false;
    const windowMs = this.appConfig().associationWindowHours * 60 * 60 * 1000;
    return (Date.now() - donation.timestamp.getTime()) <= windowMs;
  }

  /**
   * Associates an anonymous donation with a donor.
   * Updates the donation record and recalculates loyalty points.
   * Returns the updated donation, or null if ineligible.
   */
  associateDonorToDonation(donationId: number, donorId: number): Donation | null {
    const donor = this.donors.find(d => d.id === donorId);
    if (!donor) return null;

    const allDonations = this.donations;
    const target = allDonations.find((d: Donation) => d.id === donationId);
    if (!target || !this.canAssociateDonor(target)) return null;

    const recalcPoints = this.calculatePoints(target.totalItems);
    const updated: Donation = {
      ...target,
      associatedDonorId:   donorId,
      associatedDonorName: `${donor.firstName} ${donor.lastName}`,
      associatedAt:        new Date(),
      loyaltyPointsEarned: recalcPoints,
    };
    return updated;
  }

  // ── Phase 1: Reward definitions management (Req 5) ────────────────────────

  addRewardDefinition(def: Omit<RewardDefinition, 'id' | 'referenceNumber'>): RewardDefinition {
    const newDef: RewardDefinition = { ...def, id: Date.now(), referenceNumber: `RD-${Date.now()}` };
    this._rewardDefs.update(list => [...list, newDef]);
    return newDef;
  }

  updateRewardDefinition(id: number, patch: Partial<RewardDefinition>): void {
    this._rewardDefs.update(list =>
      list.map(d => d.id === id ? { ...d, ...patch } : d)
    );
  }

  removeRewardDefinition(id: number): void {
    this._rewardDefs.update(list => list.filter(d => d.id !== id));
  }

  // ── Phase 1: Reward redemption (Req 5) ────────────────────────────────────

  /**
   * Redeems a reward for a donor.
   * Deducts points and records a RewardTransaction.
   * Returns the new transaction or null if donor has insufficient points.
   */
  redeemReward(donorId: number, definitionId: number): RewardTransaction | null {
    const donor = this.donors.find(d => d.id === donorId);
    const def   = this._rewardDefs().find(d => d.id === definitionId);
    if (!donor || !def || !def.active)              return null;
    if (donor.loyaltyPoints < def.pointsRequired)   return null;

    // Deduct points (mock — mutate in-place since donors is readonly array)
    (donor as any).loyaltyPoints -= def.pointsRequired;

    const txn: RewardTransaction = {
      id:             Date.now(),
      referenceNumber: `RTX-${Date.now()}`,
      donorId,
      donorName:      `${donor.firstName} ${donor.lastName}`,
      definitionId,
      definitionName: def.name,
      pointsDeducted: def.pointsRequired,
      status:         RewardStatus.Redeemed,
      createdAt:      new Date(),
      redeemedAt:     new Date(),
    };
    this._rewardTxns.update(list => [txn, ...list]);
    return txn;
  }

  // ── Phase 1: Reward gifting (Req 7) ───────────────────────────────────────

  /**
   * Gifts a reward to another recipient.
   * The sender's balance is already deducted at redemption time.
   * This updates the transaction status and records recipient details.
   */
  giftReward(transactionId: number, recipientName: string, recipientContact: string): boolean {
    let found = false;
    this._rewardTxns.update(list =>
      list.map(t => {
        if (t.id === transactionId && t.status === RewardStatus.Active) {
          found = true;
          return { ...t, status: RewardStatus.Gifted, giftedToName: recipientName, giftedToContact: recipientContact };
        }
        return t;
      })
    );
    return found;
  }

  getRewardTransactionsForDonor(donorId: number): RewardTransaction[] {
    return this._rewardTxns().filter(t => t.donorId === donorId);
  }

  // ── Phase 1: Campaign management (Req 6) ──────────────────────────────────

  createCampaign(campaign: Omit<Campaign, 'id' | 'referenceNumber' | 'notificationHistory' | 'createdAt'>): Campaign {
    const newCampaign: Campaign = {
      ...campaign,
      id:                  Date.now(),
      referenceNumber:     `CMP-${Date.now()}`,
      notificationHistory: [],
      createdAt:           new Date(),
    };
    this._campaigns.update(list => [newCampaign, ...list]);
    return newCampaign;
  }

  updateCampaign(id: number, patch: Partial<Campaign>): void {
    this._campaigns.update(list =>
      list.map(c => c.id === id ? { ...c, ...patch } : c)
    );
  }

  saveCampaignTemplate(campaignId: number, template: NotificationTemplate): void {
    const field = template.channel === NotificationChannel.Email ? 'emailTemplate' : 'smsTemplate';
    this._campaigns.update(list =>
      list.map(c => c.id === campaignId ? { ...c, [field]: { ...template, updatedAt: new Date() } } : c)
    );
  }

  /** Resolve merge variables in a template body/subject using a sample donor */
  previewTemplate(text: string, donor: Donor, campaignName: string): string {
    return text
      .replace(/\{\{donor_name\}\}/g, `${donor.firstName} ${donor.lastName}`)
      .replace(/\{\{first_name\}\}/g, donor.firstName)
      .replace(/\{\{campaign_name\}\}/g, campaignName)
      .replace(/\{\{points\}\}/g, donor.loyaltyPoints.toLocaleString())
      .replace(/\{\{tier\}\}/g, DonorTierLabel[donor.loyaltyTier])
      .replace(/\{\{org_name\}\}/g, 'Our Organization');
  }

  /**
   * Executes a campaign: finds eligible donors by targetCriteria,
   * simulates sending notifications, and appends to notificationHistory.
   */
  executeCampaign(campaignId: number): CampaignNotification[] {
    const campaign = this._campaigns().find(c => c.id === campaignId);
    if (!campaign || campaign.status !== CampaignStatus.Active) return [];

    const cfg = this.appConfig();

    // Find donors who have donated items matching any criterion
    const eligibleDonors = this.donors.filter(donor => {
      // Exclude donors missing email when required for campaigns
      if (cfg.emailReqs.forCampaigns && !donor.email) return false;
      // All known donors are eligible in this mock (real: query donation history)
      return true;
    });

    const now = new Date();
    const newNotifications: CampaignNotification[] = eligibleDonors.map(donor => ({
      donorId:   donor.id,
      donorName: `${donor.firstName} ${donor.lastName}`,
      channel:   campaign.channel,
      sentAt:    now,
      success:   Math.random() > 0.05, // 95% success rate simulation
    }));

    this._campaigns.update(list =>
      list.map(c => c.id === campaignId
        ? { ...c, status: CampaignStatus.Active, notificationHistory: [...c.notificationHistory, ...newNotifications] }
        : c
      )
    );
    return newNotifications;
  }
}


