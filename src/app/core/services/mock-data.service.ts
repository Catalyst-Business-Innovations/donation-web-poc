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
} from '../models/domain.models';
import { StorageService } from './storage.service';
import { PresortQueueItem } from '../../modules/staff-portal/features/presort/models/presort.models';

@Injectable({ providedIn: 'root' })
export class MockDataService {
  private storage = inject(StorageService);

  readonly session: StaffSession = {
    staffId: 'staff-001',
    staffName: 'Alex Morgan',
    role: StaffRole.Attendant,
    locationId: 'loc-001',
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
    { id: 'rd-001', name: '$5 Discount',   description: 'Redeemable at POS',  pointsRequired: 100,  discountValue: 5,   icon: '🏷️', active: true,  sortOrder: 1 },
    { id: 'rd-002', name: '$10 Discount',  description: 'Redeemable at POS',  pointsRequired: 200,  discountValue: 10,  icon: '🏷️', active: true,  sortOrder: 2 },
    { id: 'rd-003', name: '$25 Discount',  description: 'Redeemable at POS',  pointsRequired: 450,  discountValue: 25,  icon: '🎟️', active: true,  sortOrder: 3 },
    { id: 'rd-004', name: 'Free Pickup',   description: 'One free pickup',     pointsRequired: 300,  discountValue: 0,   icon: '🚚', active: true,  sortOrder: 4 },
    { id: 'rd-005', name: '$50 Gift Card', description: 'Partner gift card',   pointsRequired: 900,  discountValue: 50,  icon: '🎁', active: true,  sortOrder: 5 },
  ]);
  readonly rewardDefinitions = this._rewardDefs.asReadonly();

  // ── Phase 1: Reward transactions seed data (Req 5, 7) ─────────────────────
  private _rewardTxns = signal<RewardTransaction[]>([
    {
      id: 'rtx-001', donorId: 'd-001', donorName: 'Michael Johnson',
      definitionId: 'rd-001', definitionName: '$5 Discount', pointsDeducted: 100,
      status: RewardStatus.Redeemed, createdAt: new Date('2026-03-10'), redeemedAt: new Date('2026-03-10'),
    },
    {
      id: 'rtx-002', donorId: 'd-002', donorName: 'Sarah Williams',
      definitionId: 'rd-002', definitionName: '$10 Discount', pointsDeducted: 200,
      status: RewardStatus.Gifted, createdAt: new Date('2026-03-12'),
      giftedToName: 'Emma Williams', giftedToContact: 'emma.w@email.com',
    },
  ]);
  readonly rewardTransactions = this._rewardTxns.asReadonly();

  // ── Phase 1: Campaign seed data (Req 6) ───────────────────────────────────
  private _campaigns = signal<Campaign[]>([
    {
      id: 'cmp-001',
      name: 'Winter Jacket Drive',
      description: 'Reach donors who have given winter clothing in the past',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-04-30'),
      status: CampaignStatus.Draft,
      channel: NotificationChannel.Email,
      targetCriteria: [{ categoryKey: 'clothing', categoryName: 'Clothing', subCategoryKey: 'womens', subCategoryName: "Women's" }],
      notificationHistory: [],
      createdAt: new Date('2026-03-18'),
      createdByStaffId: 'staff-001',
    },
    {
      id: 'cmp-002',
      name: 'Electronics Recycling Push',
      description: 'Encourage electronics donors to donate again',
      startDate: new Date('2026-03-20'),
      endDate: new Date('2026-03-31'),
      status: CampaignStatus.Active,
      channel: NotificationChannel.Both,
      targetCriteria: [{ categoryKey: 'electronics', categoryName: 'Electronics' }],
      notificationHistory: [
        { donorId: 'd-005', donorName: 'David Chen',       channel: NotificationChannel.Email, sentAt: new Date('2026-03-20'), success: true },
        { donorId: 'd-010', donorName: 'Lisa Anderson',    channel: NotificationChannel.SMS,   sentAt: new Date('2026-03-20'), success: true },
      ],
      createdAt: new Date('2026-03-15'),
      createdByStaffId: 'staff-001',
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
      id: 'loc-001',
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
      id: 'loc-002',
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
      id: 'loc-003',
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
      id: 'loc-004',
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
      id: 'd-001',
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
      id: 'd-002',
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
      id: 'd-003',
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
      id: 'd-004',
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
      id: 'd-005',
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
      id: 'd-006',
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
      id: 'd-007',
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
      id: 'd-008',
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
      id: 'd-009',
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
      id: 'd-010',
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
      id: 'd-011',
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
      id: 'd-012',
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
      id: 'd-013',
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
      id: 'd-014',
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
      id: 'd-015',
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
      id: 'don-001',
      receiptNumber: 'DN-001234',
      donorId: 'd-001',
      donorName: 'Michael Johnson',
      donorInitials: 'MJ',
      donorTier: DonorTier.Gold,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-15T14:45:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-001',
          donationId: 'don-001',
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 8,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 96
        },
        {
          id: 'i-002',
          donationId: 'don-001',
          categoryKey: 'books',
          categoryName: 'Books',
          quantity: 5,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 25
        },
        {
          id: 'i-003',
          donationId: 'don-001',
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
      id: 'don-002',
      receiptNumber: 'DN-001233',
      donorId: 'd-002',
      donorName: 'Sarah Williams',
      donorInitials: 'SW',
      donorTier: DonorTier.Gold,
      locationId: 'loc-002',
      locationName: 'Northside Store',
      attendantId: 'staff-002',
      timestamp: new Date('2026-03-15T14:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-004',
          donationId: 'don-002',
          categoryKey: 'shoes',
          categoryName: 'Shoes',
          quantity: 4,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 60
        },
        {
          id: 'i-005',
          donationId: 'don-002',
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
      id: 'don-003',
      receiptNumber: 'DN-001232',
      donorId: 'd-003',
      donorName: 'Robert Martinez',
      donorInitials: 'RM',
      donorTier: DonorTier.Silver,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-15T14:15:00'),
      status: DonationStatus.CheckedIn,
      items: [
        {
          id: 'i-006',
          donationId: 'don-003',
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 2,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 250
        },
        {
          id: 'i-007',
          donationId: 'don-003',
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
      id: 'don-004',
      receiptNumber: 'DN-001231',
      donorId: 'd-004',
      donorName: 'Lisa Park',
      donorInitials: 'LP',
      donorTier: DonorTier.Bronze,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-14T10:20:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-008',
          donationId: 'don-004',
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
      id: 'don-005',
      receiptNumber: 'DN-001230',
      donorId: 'd-005',
      donorName: 'David Chen',
      donorInitials: 'DC',
      donorTier: DonorTier.Platinum,
      locationId: 'loc-002',
      locationName: 'Northside Store',
      attendantId: 'staff-002',
      timestamp: new Date('2026-03-13T15:50:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-009',
          donationId: 'don-005',
          categoryKey: 'electronics',
          categoryName: 'Electronics',
          quantity: 3,
          estimatedValuePerItem: 50,
          totalEstimatedValue: 150
        },
        {
          id: 'i-010',
          donationId: 'don-005',
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
      id: 'don-006',
      receiptNumber: 'DN-001229',
      donorId: 'd-006',
      donorName: 'Jennifer Taylor',
      donorInitials: 'JT',
      donorTier: DonorTier.Gold,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-12T11:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-011',
          donationId: 'don-006',
          categoryKey: 'toys',
          categoryName: 'Toys & Games',
          quantity: 8,
          estimatedValuePerItem: 10,
          totalEstimatedValue: 80
        },
        {
          id: 'i-012',
          donationId: 'don-006',
          categoryKey: 'home_decor',
          categoryName: 'Home Décor',
          quantity: 5,
          estimatedValuePerItem: 15,
          totalEstimatedValue: 75
        },
        {
          id: 'i-013',
          donationId: 'don-006',
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
      id: 'don-007',
      receiptNumber: 'DN-001228',
      donorId: 'd-007',
      donorName: 'James Anderson',
      donorInitials: 'JA',
      donorTier: DonorTier.Silver,
      locationId: 'loc-003',
      locationName: 'Westside Store',
      attendantId: 'staff-003',
      timestamp: new Date('2026-03-11T09:15:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-014',
          donationId: 'don-007',
          categoryKey: 'sporting',
          categoryName: 'Sporting Goods',
          quantity: 6,
          estimatedValuePerItem: 25,
          totalEstimatedValue: 150
        },
        {
          id: 'i-015',
          donationId: 'don-007',
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
      id: 'don-008',
      receiptNumber: 'DN-001227',
      donorId: 'd-009',
      donorName: 'Thomas Brown',
      donorInitials: 'TB',
      donorTier: DonorTier.Platinum,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-10T13:40:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-016',
          donationId: 'don-008',
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 1,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 125
        },
        {
          id: 'i-017',
          donationId: 'don-008',
          categoryKey: 'housewares',
          categoryName: 'Housewares',
          quantity: 15,
          estimatedValuePerItem: 8,
          totalEstimatedValue: 120
        },
        {
          id: 'i-018',
          donationId: 'don-008',
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
      id: 'don-009',
      receiptNumber: 'DN-001226',
      donorId: 'd-010',
      donorName: 'Nancy Wilson',
      donorInitials: 'NW',
      donorTier: DonorTier.Silver,
      locationId: 'loc-002',
      locationName: 'Northside Store',
      attendantId: 'staff-002',
      timestamp: new Date('2026-03-09T16:20:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-019',
          donationId: 'don-009',
          categoryKey: 'books',
          categoryName: 'Books & Media',
          quantity: 20,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 100
        },
        {
          id: 'i-020',
          donationId: 'don-009',
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
      id: 'don-010',
      receiptNumber: 'DN-001225',
      donorId: 'd-011',
      donorName: 'Daniel Moore',
      donorInitials: 'DM',
      donorTier: DonorTier.Gold,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-08T10:00:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-021',
          donationId: 'don-010',
          categoryKey: 'clothing',
          categoryName: 'Clothing',
          quantity: 15,
          estimatedValuePerItem: 12,
          totalEstimatedValue: 180
        },
        {
          id: 'i-022',
          donationId: 'don-010',
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
      id: 'don-011',
      receiptNumber: 'DN-001224',
      donorId: 'd-001',
      donorName: 'Michael Johnson',
      donorInitials: 'MJ',
      donorTier: DonorTier.Gold,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-03-01T14:25:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-023',
          donationId: 'don-011',
          categoryKey: 'books',
          categoryName: 'Books & Media',
          quantity: 8,
          estimatedValuePerItem: 5,
          totalEstimatedValue: 40
        },
        {
          id: 'i-024',
          donationId: 'don-011',
          categoryKey: 'housewares',
          categoryName: 'Housewares',
          quantity: 6,
          estimatedValuePerItem: 8,
          totalEstimatedValue: 48
        },
        {
          id: 'i-025',
          donationId: 'don-011',
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
      id: 'don-012',
      receiptNumber: 'DN-001223',
      donorId: 'd-002',
      donorName: 'Sarah Williams',
      donorInitials: 'SW',
      donorTier: DonorTier.Gold,
      locationId: 'loc-002',
      locationName: 'Northside Store',
      attendantId: 'staff-002',
      timestamp: new Date('2026-02-28T11:10:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-026',
          donationId: 'don-012',
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
      id: 'don-013',
      receiptNumber: 'DN-001222',
      donorId: 'd-014',
      donorName: 'Rebecca White',
      donorInitials: 'RW',
      donorTier: DonorTier.Platinum,
      locationId: 'loc-001',
      locationName: 'Downtown Store',
      attendantId: 'staff-001',
      timestamp: new Date('2026-02-25T15:30:00'),
      status: DonationStatus.Completed,
      items: [
        {
          id: 'i-027',
          donationId: 'don-013',
          categoryKey: 'furniture',
          categoryName: 'Furniture',
          quantity: 2,
          estimatedValuePerItem: 125,
          totalEstimatedValue: 250
        },
        {
          id: 'i-028',
          donationId: 'don-013',
          categoryKey: 'electronics',
          categoryName: 'Electronics',
          quantity: 4,
          estimatedValuePerItem: 50,
          totalEstimatedValue: 200
        },
        {
          id: 'i-029',
          donationId: 'don-013',
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
      id: 'c-001',
      barcode: 'BRJ-2026-001234',
      donationId: 'don-001',
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
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T07:10:00'),
      updatedAt: new Date('2026-03-16T08:30:00'),
      presortedAt: new Date('2026-03-16T08:30:00'),
      totalItems: 40, totalEstimatedValue: 516
    },
    {
      id: 'c-002',
      barcode: 'BRJ-2026-001235',
      donationId: 'don-002',
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
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T06:00:00'),
      updatedAt: new Date('2026-03-16T10:00:00'),
      presortedAt: new Date('2026-03-16T09:00:00'),
      totalItems: 63, totalEstimatedValue: 405
    },
    {
      id: 'c-003',
      barcode: 'BRJ-2026-001236',
      donationId: 'don-003',
      donationReceiptNumber: 'DN-001232',
      donorVisitLabel: 'Walk-in Drop',
      containerType: ContainerType.Gaylord,
      presortMethod: PresortMethod.DockSide,
      deptKey: 'clothes', deptName: 'Clothing & Accessories',
      contents: [{ categoryKey: 'clothing', categoryName: 'Clothing', quantity: 50, condition: ItemCondition.Sellable }],
      destination: ContainerDest.Warehouse,
      status: ContainerStatus.Available,
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T11:00:00'),
      updatedAt: new Date('2026-03-16T11:00:00'),
      totalItems: 50, totalEstimatedValue: 600
    },
    {
      id: 'c-004',
      barcode: 'BRJ-2026-001237',
      donationId: 'don-005',
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
      locationId: 'loc-002', locationName: 'Northside Store',
      createdAt: new Date('2026-03-15T16:00:00'),
      updatedAt: new Date('2026-03-15T17:00:00'),
      presortedAt: new Date('2026-03-15T17:00:00'),
      totalItems: 8, totalEstimatedValue: 400
    },
    {
      id: 'c-005',
      barcode: 'BRJ-2026-001238',
      containerType: ContainerType.Pallet,
      deptKey: 'home', deptName: 'Home & Living',
      catKey: 'furniture', catName: 'Furniture',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T13:30:00'),
      updatedAt: new Date('2026-03-16T13:30:00'),
      totalItems: 0, totalEstimatedValue: 0
    },
    {
      id: 'c-006',
      barcode: 'BRJ-2026-001239',
      containerType: ContainerType.Baler,
      deptKey: 'salvage', deptName: 'Salvage & Recycling',
      catKey: 'salvage', catName: 'Salvage/Recycling',
      contents: [],
      destination: ContainerDest.Salvage,
      status: ContainerStatus.Available,
      salvageWeightLbs: 120,
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date('2026-03-16T09:00:00'),
      updatedAt: new Date('2026-03-16T09:00:00'),
      totalItems: 0, totalEstimatedValue: 0,
      notes: 'Textile bale — scheduled for pickup'
    },
    {
      id: 'c-007',
      barcode: 'BRJ-2026-001240',
      donorVisitLabel: 'Walk-in Drop (Anonymous)',
      containerType: ContainerType.Gaylord,
      presortMethod: PresortMethod.Batch,
      deptKey: 'clothes', deptName: 'Clothing & Accessories',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 'loc-001', locationName: 'Downtown Store',
      createdAt: new Date(Date.now() - 78 * 60 * 1000),
      updatedAt: new Date(Date.now() - 78 * 60 * 1000),
      totalItems: 65, totalEstimatedValue: 0
    },
    {
      id: 'c-008',
      barcode: 'BRJ-2026-001241',
      donationReceiptNumber: 'DN-001237',
      donorVisitLabel: 'Robert Martinez · DN-001237',
      containerType: ContainerType.Pallet,
      presortMethod: PresortMethod.Batch,
      deptKey: 'home', deptName: 'Home & Living',
      contents: [],
      status: ContainerStatus.Available,
      locationId: 'loc-001', locationName: 'Downtown Store',
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
      { locationId: 'loc-001', locationName: 'Downtown Store', totalValue: 7420, percentage: 100 },
      { locationId: 'loc-002', locationName: 'Northside Store', totalValue: 5890, percentage: 79 },
      { locationId: 'loc-003', locationName: 'Westside Store', totalValue: 3240, percentage: 44 },
      { locationId: 'loc-004', locationName: 'Eastside Store', totalValue: 1850, percentage: 25 }
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

  getDonorById(id: string): Donor | undefined {
    return this.donors.find(d => d.id === id);
  }

  getDonationsByDonor(donorId: string): Donation[] {
    return this.donations
      .filter(d => d.donorId === donorId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  getContainersByLocation(locationId: string): Container[] {
    return this.containers.filter(c => c.locationId === locationId);
  }

  getDonationById(id: string): Donation | undefined {
    return this.donations.find(d => d.id === id);
  }

  getLocationById(id: string): Location | undefined {
    return this.locations.find(l => l.id === id);
  }

  getCategoryByKey(key: string): DonationCategory | undefined {
    return this.categories.find(c => c.key === key);
  }

  // Simulated creation methods (would be API calls in production)
  createDonation(donation: Partial<Donation>): Donation {
    const newDonation: Donation = {
      id: `don-${Date.now()}`,
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

  updateDonation(id: string, updates: Partial<Donation>): Donation | undefined {
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
      id: `c-${Date.now()}`,
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

  updateContainer(id: string, updates: Partial<Container>): Container | undefined {
    const index = this.containers.findIndex(c => c.id === id);
    if (index >= 0) {
      this.containers[index] = { ...this.containers[index], ...updates, updatedAt: new Date() };
      this.storage.saveContainers(this.containers);
      return this.containers[index];
    }
    return undefined;
  }

  updateDonor(id: string, patch: Partial<Donor>): void {
    const index = this.donors.findIndex(d => d.id === id);
    if (index >= 0) {
      (this.donors as Donor[])[index] = { ...this.donors[index], ...patch };
    }
  }

  addDonor(donor: Omit<Donor, 'id' | 'joinDate' | 'totalDonations' | 'lifetimeValue' | 'loyaltyPoints' | 'loyaltyTier'>): Donor {
    const newDonor: Donor = {
      ...donor,
      id: `d-${Date.now()}`,
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
      { id: 'r-001', name: '$5 Gift Card', pointsRequired: 500, icon: '💳', category: 'gift-card' },
      { id: 'r-002', name: '$10 Gift Card', pointsRequired: 1000, icon: '💳', category: 'gift-card' },
      { id: 'r-003', name: '$25 Gift Card', pointsRequired: 2500, icon: '💳', category: 'gift-card' },
      { id: 'r-004', name: 'Free Pickup Service', pointsRequired: 300, icon: '🚚', category: 'service' },
      { id: 'r-005', name: 'Priority Processing', pointsRequired: 150, icon: '⚡', category: 'service' },
      { id: 'r-006', name: 'Thank You Mug', pointsRequired: 800, icon: '☕', category: 'merchandise' },
      { id: 'r-007', name: 'Tote Bag', pointsRequired: 600, icon: '👜', category: 'merchandise' },
      { id: 'r-008', name: 'Branded T-Shirt', pointsRequired: 1200, icon: '👕', category: 'merchandise' }
    ];
  }

  getScheduledPickups(donorId?: string) {
    return this.getScheduledDonations(donorId);
  }

  getScheduledDonations(donorId?: string): import('../models/domain.models').ScheduledDonation[] {
    const appts: import('../models/domain.models').ScheduledDonation[] = [
      {
        id: 'APT-20260320-001',
        donorId: 'd-001',
        donorName: 'Michael Johnson',
        donorPhone: '(555) 101-2020',
        donorEmail: 'michael.j@email.com',
        address: '123 Main St, Springfield',
        locationId: 'loc-001',
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
        id: 'APT-20260322-002',
        donorId: 'd-002',
        donorName: 'Sarah Williams',
        donorPhone: '(555) 234-5678',
        donorEmail: 'sarah.w@email.com',
        address: '456 Oak Ave, Springfield',
        locationId: 'loc-001',
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
        id: 'APT-20260318-003',
        donorId: 'd-005',
        donorName: 'David Chen',
        donorPhone: '(555) 555-9900',
        donorEmail: 'david.c@email.com',
        address: '555 Maple Dr, Springfield',
        locationId: 'loc-002',
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
        id: 'APT-20260325-004',
        donorId: 'd-006',
        donorName: 'Jennifer Taylor',
        donorPhone: '(555) 321-6543',
        donorEmail: 'jen.t@email.com',
        address: '111 Cedar Ln, Springfield',
        locationId: 'loc-001',
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
        id: 'APT-20260319-005',
        donorId: 'd-009',
        donorName: 'Thomas Brown',
        donorPhone: '(555) 777-1234',
        donorEmail: 'thomas.b@email.com',
        address: '444 Willow Ct, Springfield',
        locationId: 'loc-003',
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
        id: 'APT-20260328-006',
        donorName: 'Anonymous',
        locationId: 'loc-002',
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
        id: 'APT-20260401-007',
        donorId: 'd-003',
        donorName: 'Robert Martinez',
        donorPhone: '(555) 456-7890',
        donorEmail: 'roberto.m@email.com',
        address: '789 Elm St, Springfield',
        locationId: 'loc-001',
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
      id: `p-${Date.now()}`,
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
  associateDonorToDonation(donationId: string, donorId: string): Donation | null {
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

  addRewardDefinition(def: Omit<RewardDefinition, 'id'>): RewardDefinition {
    const newDef: RewardDefinition = { ...def, id: `rd-${Date.now()}` };
    this._rewardDefs.update(list => [...list, newDef]);
    return newDef;
  }

  updateRewardDefinition(id: string, patch: Partial<RewardDefinition>): void {
    this._rewardDefs.update(list =>
      list.map(d => d.id === id ? { ...d, ...patch } : d)
    );
  }

  removeRewardDefinition(id: string): void {
    this._rewardDefs.update(list => list.filter(d => d.id !== id));
  }

  // ── Phase 1: Reward redemption (Req 5) ────────────────────────────────────

  /**
   * Redeems a reward for a donor.
   * Deducts points and records a RewardTransaction.
   * Returns the new transaction or null if donor has insufficient points.
   */
  redeemReward(donorId: string, definitionId: string): RewardTransaction | null {
    const donor = this.donors.find(d => d.id === donorId);
    const def   = this._rewardDefs().find(d => d.id === definitionId);
    if (!donor || !def || !def.active)              return null;
    if (donor.loyaltyPoints < def.pointsRequired)   return null;

    // Deduct points (mock — mutate in-place since donors is readonly array)
    (donor as any).loyaltyPoints -= def.pointsRequired;

    const txn: RewardTransaction = {
      id:             `rtx-${Date.now()}`,
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
  giftReward(transactionId: string, recipientName: string, recipientContact: string): boolean {
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

  getRewardTransactionsForDonor(donorId: string): RewardTransaction[] {
    return this._rewardTxns().filter(t => t.donorId === donorId);
  }

  // ── Phase 1: Campaign management (Req 6) ──────────────────────────────────

  createCampaign(campaign: Omit<Campaign, 'id' | 'notificationHistory' | 'createdAt'>): Campaign {
    const newCampaign: Campaign = {
      ...campaign,
      id:                  `cmp-${Date.now()}`,
      notificationHistory: [],
      createdAt:           new Date(),
    };
    this._campaigns.update(list => [newCampaign, ...list]);
    return newCampaign;
  }

  updateCampaign(id: string, patch: Partial<Campaign>): void {
    this._campaigns.update(list =>
      list.map(c => c.id === id ? { ...c, ...patch } : c)
    );
  }

  /**
   * Executes a campaign: finds eligible donors by targetCriteria,
   * simulates sending notifications, and appends to notificationHistory.
   */
  executeCampaign(campaignId: string): CampaignNotification[] {
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


