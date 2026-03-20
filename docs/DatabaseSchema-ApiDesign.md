# Database Schema & API Design

> **Scope:** Production-ready design derived from the Angular 20 POC (`MockDataService`).
> Tables marked **[EXISTING]** are already in the platform database and are referenced but not redefined here.
> Improvements over the POC are marked **[NEW]**.

---

## Table of Contents

1. [Enums](#enums)
2. [Database Schema](#database-schema)
   - [SharedUsers (modified)](#sharedusers-modified)
   - [Stores (existing + new)](#stores-existing--new)
   - [Taxonomy (existing)](#taxonomy-existing)
   - [Donors](#donors)
   - [LoyaltyPointTransactions](#loyaltypointtransactions-new)
   - [Donations](#donations)
   - [Receipts](#receipts-new)
   - [Containers & Presort](#containers--presort)
   - [Loyalty Rewards](#loyalty-rewards)
   - [Campaigns](#campaigns)
   - [System Configuration](#system-configuration)
3. [Entity Relationship Summary](#entity-relationship-summary)
4. [API Design](#api-design)
5. [Improvements over POC](#improvements-over-poc)

---

## Enums

String values are stored in the database columns. ORM converters handle mapping between enum types and their string representations.

| Enum | Values |
|------|--------|
| `UserType` **[NEW]** | Internal, External |
| `Status` **[NEW]** | Active, Inactive |
| `DonorTier` | Bronze, Silver, Gold, Platinum |
| `ContainerStatus` | Available, ReadyForSorting, Sorting, InUse, Closed |
| `ContainerDest` | Production, Reserve, Warehouse, Transfer, Salvage, Ecommerce |
| `ItemCondition` | Sellable, NeedsRefurbishment, Salvage, Dispose |
| `ContainerType` | Gaylord, CartRack, Pallet, Tote, Baler |
| `PresortMethod` | DockSide, Batch |
| `PaymentMethod` | CreditCard, DebitCard, ApplePay, GooglePay, Cash |
| `ReceiptDelivery` | Email, SMS, Print, None |
| `StoreStatus` | Open, Closed, Busy |
| `DonationStatus` | Scheduled, CheckedIn, Completed, Cancelled, NoShow |
| `DonationMethod` | WalkIn, Scheduled, Pickup |
| `DonationScope` | Items, Monetary, Both |
| `PointsCalcMethod` | PerItem, PerWeight |
| `RewardType` | Discount, Cashback, Gift, Voucher |
| `RedemptionStatus` | Pending, Approved, Rejected, Fulfilled, Cancelled |
| `CampaignStatus` | Draft, Active, Paused, Completed |
| `NotificationChannel` | Email, SMS, Both |
| `PresortStatus` **[NEW]** | Queued, InProgress, Completed |
| `LoyaltyPointTransactionReason` **[NEW]** | DonationEarned, RedemptionDebit, GiftSent, GiftReceived, ManualAdjust, Expiry |
| `BadgeType` **[NEW]** | FirstDonation, Donations10, Donations25, Donations50, CommunityHero, YearRoundDonor |
| `TaxReceiptStatus` **[NEW]** | Pending, Ready, Sent |
| `DayOfWeek` **[NEW]** | Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday |

---

## Database Schema

### Base Entity

All tables that own a surrogate primary key extend `BaseAuditableEntity` in the .NET domain layer.
The following columns are **inherited and not repeated in individual table definitions below**:

```sql
-- Columns inherited from BaseAuditableEntity on every full-entity table:
Id                BIGSERIAL       PRIMARY KEY,
CreatedAt         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
CreatedById       BIGINT          NOT NULL REFERENCES SharedUsers(Id),
LastModifiedAt    TIMESTAMPTZ,                                          -- NULL until first update
LastModifiedById  BIGINT          REFERENCES SharedUsers(Id),
IsDeleted         BOOLEAN         NOT NULL DEFAULT FALSE                -- soft-delete flag
```

> **Type convention:** All `Id` columns are `BIGSERIAL` (maps to C# `long`). All foreign-key references to `Id` columns are `BIGINT`.

**Exception tables** — these use a composite or foreign-key primary key and do **not** inherit `BaseAuditableEntity`:
`DonationCategories`, `ContainerCapacity`, `LoyaltyTierConfig`, `AppConfig`, `DonorPreferences`

---

### SharedUsers (modified)

The `SharedUsers` table already exists in the platform and manages credentials for internal (platform) users.
Add a `UserType` column to extend it to external donor accounts without a separate auth table.

```sql
-- EXISTING table — add UserType column only
ALTER TABLE SharedUsers
  ADD COLUMN UserType VARCHAR(20) NOT NULL DEFAULT 'Internal';  -- UserType enum

-- Internal users  → Donors.UserId is NULL; user operates via platform roles/permissions
-- External users  → Donors record  (UserType = 'External')
```

---

### Stores (existing + new)

`Stores`, along with `Departments`, `Categories`, and `SubCategories`, **[EXISTING]** — already present in the platform database. No changes to those tables.

Two new tables are added:

```sql
-- [NEW] Structured open/close times per day; replaces the unstructured Hours string on Stores
StoreHours (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId   BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  StoreId     BIGINT      NOT NULL REFERENCES Stores(Id) ON DELETE CASCADE,
  DayOfWeek   SMALLINT    NOT NULL,                        -- DayOfWeek enum (0=Sun … 6=Sat)
  OpenTime    TIME,                                        -- NULL when IsClosed = TRUE
  CloseTime   TIME,
  IsClosed    BOOLEAN      NOT NULL DEFAULT FALSE,         -- IsClosed overrides OpenTime/CloseTime
  Status      VARCHAR(20)  NOT NULL DEFAULT 'Active',     -- Status enum
  UNIQUE (StoreId, DayOfWeek)
)

-- [NEW] Bookable time slots per store; replaces the hardcoded '9:00 AM … 5:00 PM' array in the UI
TimeSlots (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId     BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  StoreId       BIGINT      NOT NULL REFERENCES Stores(Id) ON DELETE CASCADE,
  StartTime     TIME        NOT NULL,                      -- e.g. 09:00
  EndTime       TIME        NOT NULL,                      -- e.g. 10:00
  MaxCapacity   INT         NOT NULL DEFAULT 5,            -- max concurrent bookings
  Status        VARCHAR(20)  NOT NULL DEFAULT 'Active',    -- Status enum
  UNIQUE (StoreId, StartTime)
)
```

---

### Taxonomy (existing)

`Departments`, `Categories`, and `SubCategories` **[EXISTING]** — no changes required.
Referenced by `DonationItems`, `ContainerContents`, `CampaignTargetCriteria`.

---

### Donors

Donors are **External** platform users. `UserId` links to `Users` for self-service portal login.
`UserId` is nullable to support anonymous walk-in donors who have no account.

```sql
Donors (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId           BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber     VARCHAR(20)     UNIQUE NOT NULL,     -- e.g. DNR-001
  UserId              BIGINT          UNIQUE REFERENCES SharedUsers(Id),  -- NULL = anonymous; UserType = External
  LoyaltyTier         VARCHAR(20)     NOT NULL DEFAULT 'Bronze',  -- DonorTier enum
  LoyaltyPoints       INT             NOT NULL DEFAULT 0,  -- denormalized from LoyaltyPointTransactions
  TotalDonations      INT             NOT NULL DEFAULT 0,  -- denormalized count
  LifetimeValue       DECIMAL(12,2)   NOT NULL DEFAULT 0,  -- denormalized sum
  PreferredStoreId    BIGINT          REFERENCES Stores(Id),
  JoinDate            DATE            NOT NULL,
  LastDonationDate    DATE,
  Status              VARCHAR(20)     NOT NULL DEFAULT 'Active'  -- Status enum
)
```

> `FirstName`, `LastName`, `Email`, `Phone`, `Address` are read from `Users` — not duplicated on `Donors`.
> Internal users (staff) are identified by `Users.UserType = Internal` and operate through platform roles — no separate Staff record needed.
> Anonymous donors have no `UserId`; they may be linked post-hoc via `Donations.AssociatedDonorId` (Req 1).

```sql
-- [NEW] Explicit badge records; donor dashboard already displays these
DonorBadges (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId   BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  DonorId     BIGINT      NOT NULL REFERENCES Donors(Id) ON DELETE CASCADE,
  BadgeType   VARCHAR(30)  NOT NULL,                       -- BadgeType enum
  EarnedAt    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (DonorId, BadgeType)
)
```

---

### LoyaltyPointTransactions [NEW]

Replaces the single `LoyaltyPoints` balance column with an append-only audit log.
`Donors.LoyaltyPoints` is a denormalized running total updated on each ledger write.

```sql
LoyaltyPointTransactions (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- Append-only — LastModifiedAt/LastModifiedById will always be NULL
  CompanyId   BIGINT       NOT NULL REFERENCES SharedCompanies(Id),
  DonorId     BIGINT       NOT NULL REFERENCES Donors(Id),
  Delta       INT          NOT NULL,                       -- positive = credit, negative = debit
  Reason      VARCHAR(30)  NOT NULL,                       -- LoyaltyPointTransactionReason enum
  RefId       BIGINT,                                      -- DonationId, RewardTransactionId, etc.
  RefType     VARCHAR(50),                                 -- 'Donation', 'RewardTransaction', 'Manual'
  Note        TEXT,                                        -- staff note for ManualAdjust entries
  ExpiresAt   TIMESTAMPTZ                                  -- NULL = never expires; set for credit entries per AppConfig.PointsExpiryDays
)
```

---

### Donations

`Donations` and `ScheduledDonations` are **merged into one table**.
`DonationMethod` (WalkIn / Scheduled / Pickup) distinguishes the type.
`DonationStatus` (Scheduled → CheckedIn → Completed / Cancelled / NoShow) tracks the lifecycle.
Scheduling fields are populated for `Method = Scheduled` or `Pickup`; they are `NULL` for `WalkIn`.

`DonationItems` and `MonetaryDonations` are **merged into one table**.
Each row carries a `Scope` column: `Items` rows hold physical-item fields; `Monetary` rows hold payment fields.
A donation with `Scope = Both` will have rows of each type.

```sql
Donations (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId             BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber       VARCHAR(20)     UNIQUE NOT NULL,
  ReceiptNumber         VARCHAR(30)     UNIQUE,                        -- NULL until Completed
  DonorId               BIGINT          REFERENCES Donors(Id),         -- NULL = anonymous; set at check-in or post-payment association
  IsAssociatedLater     BOOLEAN         NOT NULL DEFAULT FALSE,        -- TRUE when DonorId was linked after completion (Req 1)
  AssociatedAt          TIMESTAMPTZ,                                   -- timestamp of post-payment association
  -- Anonymous walk-in contact (populated when DonorId is NULL)
  GuestName             VARCHAR(200),
  GuestPhone            VARCHAR(30),
  GuestEmail            VARCHAR(255),
  StoreId               BIGINT          NOT NULL REFERENCES Stores(Id),
  AttendantId           BIGINT          REFERENCES SharedUsers(Id),    -- NULL for donor self-scheduled
  Status                VARCHAR(20)     NOT NULL,                      -- DonationStatus enum; set explicitly by API (no default — varies by Method)
  Method                VARCHAR(20)     NOT NULL DEFAULT 'WalkIn',     -- DonationMethod enum
  Scope                 VARCHAR(20)     NOT NULL DEFAULT 'Items',      -- DonationScope enum
  TotalItems            INT             NOT NULL DEFAULT 0,
  TotalEstimatedValue   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  LoyaltyPointsEarned   INT             NOT NULL DEFAULT 0,
  PresortCompleted      BOOLEAN         NOT NULL DEFAULT FALSE,
  IsPreSorted           BOOLEAN         NOT NULL DEFAULT FALSE,
  ReceiptDelivery       VARCHAR(10),                                    -- ReceiptDelivery enum
  Notes                 TEXT,
  -- Scheduling fields (populated when Method = Scheduled or Pickup; NULL for WalkIn)
  ScheduledDate         DATE,
  TimeSlotId            BIGINT          REFERENCES TimeSlots(Id),
  Recurring             VARCHAR(20),                                    -- 'none','weekly','biweekly','monthly'
  PickupAddress         TEXT,                                           -- for Method = Pickup
  ExpectedItemCount     INT,                                            -- pre-planned estimate
  CancellationReason    TEXT,                                           -- required when Status = Cancelled
  CancelledByUserId     BIGINT          REFERENCES SharedUsers(Id),
  DonationAt            TIMESTAMPTZ     NOT NULL DEFAULT NOW()          -- when the physical donation event occurred
)

-- Covers both physical items (Scope=Items) and monetary entries (Scope=Monetary) in one table
DonationItems (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId                BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  DonationId               BIGINT          NOT NULL REFERENCES Donations(Id) ON DELETE CASCADE,
  ReferenceNumber          VARCHAR(20)     UNIQUE NOT NULL,
  Scope                    VARCHAR(20)     NOT NULL DEFAULT 'Items',    -- DonationScope enum
  -- Physical item fields (Scope = Items)
  DepartmentKey            VARCHAR(50)     REFERENCES Departments(Key),
  CategoryKey              VARCHAR(50)     REFERENCES Categories(Key),
  SubCategoryKey           VARCHAR(50)     REFERENCES SubCategories(Key),
  Quantity                 INT,
  EstimatedValuePerItem    DECIMAL(10,2),
  TotalEstimatedValue      DECIMAL(10,2),
  Condition                VARCHAR(30),                                  -- ItemCondition enum
  -- Monetary payment fields (Scope = Monetary)
  Amount                   DECIMAL(12,2),
  PaymentMethod            VARCHAR(20),                                  -- PaymentMethod enum
  CardTxnRef               VARCHAR(100),                                 -- card processor reference
  CashTendered             DECIMAL(12,2),                                -- for cash payments
  ChangeGiven              DECIMAL(12,2)
)

-- Pre-planned item categories for scheduled donations (donor's "giving cart")
-- Exception: composite PK — does NOT inherit BaseAuditableEntity
DonationCategories (
  CompanyId     BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  DonationId    BIGINT      NOT NULL REFERENCES Donations(Id) ON DELETE CASCADE,
  CategoryKey   VARCHAR(50) NOT NULL REFERENCES Categories(Key),
  PRIMARY KEY (DonationId, CategoryKey)
)
```

---

### Receipts [NEW]

```sql
-- One row per completed donation; auto-created when Donation.Status → Completed
Receipts (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId       BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber VARCHAR(30) UNIQUE NOT NULL,
  DonationId      BIGINT      NOT NULL UNIQUE REFERENCES Donations(Id),
  DonorId         BIGINT      REFERENCES Donors(Id),
  PrintedAt       TIMESTAMPTZ,
  EmailedAt       TIMESTAMPTZ,
  SmsSentAt       TIMESTAMPTZ
)

-- Annual tax receipt roll-up per donor per year
TaxReceipts (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId       BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  DonorId         BIGINT          NOT NULL REFERENCES Donors(Id),
  Year            SMALLINT        NOT NULL,
  TotalDonations  INT             NOT NULL DEFAULT 0,
  TotalItems      INT             NOT NULL DEFAULT 0,
  TotalValue      DECIMAL(12,2)   NOT NULL DEFAULT 0,
  Status          VARCHAR(20)     NOT NULL DEFAULT 'Pending',          -- TaxReceiptStatus enum
  GeneratedAt     TIMESTAMPTZ,
  SentAt          TIMESTAMPTZ,
  UNIQUE (DonorId, Year)
)
```

---

### Containers & Presort

```sql
-- [NEW] Config-driven capacity limits per container type (replaces hardcoded UI values)
-- Exception: composite PK — does NOT inherit BaseAuditableEntity
ContainerCapacity (
  CompanyId       BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  ContainerType   VARCHAR(20) NOT NULL,                                -- ContainerType enum
  MaxItems        INT         NOT NULL,                                -- Gaylord=400, CartRack=80, Pallet=200, Tote=50
  PRIMARY KEY (CompanyId, ContainerType)
)

Containers (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId             BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber       VARCHAR(20)     UNIQUE NOT NULL,
  Barcode               VARCHAR(100)    UNIQUE NOT NULL,
  DonationId            BIGINT          REFERENCES Donations(Id),
  ContainerType         VARCHAR(20)     NOT NULL,                       -- ContainerType enum
  PresortMethod         VARCHAR(20),                                    -- PresortMethod enum
  PresortWorkerId       BIGINT          REFERENCES SharedUsers(Id),
  Destination           VARCHAR(20),                                    -- ContainerDest enum
  Status                VARCHAR(30)     NOT NULL DEFAULT 'Available',  -- ContainerStatus enum
  DeptKey               VARCHAR(50)     REFERENCES Departments(Key),
  CatKey                VARCHAR(50)     REFERENCES Categories(Key),
  StoreId               BIGINT          NOT NULL REFERENCES Stores(Id),
  TotalItems            INT             NOT NULL DEFAULT 0,
  TotalEstimatedValue   DECIMAL(12,2)   NOT NULL DEFAULT 0,
  SalvageWeightLbs      DECIMAL(8,2),
  IsSeasonal            BOOLEAN         NOT NULL DEFAULT FALSE,
  SeasonalTag           VARCHAR(100),
  ParentContainerId     BIGINT          REFERENCES Containers(Id),      -- self-ref for splits
  TransferToStoreId     BIGINT          REFERENCES Stores(Id),
  Notes                 TEXT,
  PresortedAt           TIMESTAMPTZ,
  ClosedAt              TIMESTAMPTZ
)

ContainerContents (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId     BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  ContainerId   BIGINT      NOT NULL REFERENCES Containers(Id) ON DELETE CASCADE,
  CategoryKey   VARCHAR(50) REFERENCES Categories(Key),
  Quantity      INT         NOT NULL DEFAULT 0,
  Condition     VARCHAR(30) NOT NULL,                                   -- ItemCondition enum
  EcommerceQty  INT         NOT NULL DEFAULT 0
)

-- Audit log of container merges — append-only
ContainerMerges (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- Append-only — LastModifiedAt/LastModifiedById will always be NULL
  CompanyId           BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  TargetContainerId   BIGINT      NOT NULL REFERENCES Containers(Id),
  SourceContainerId   BIGINT      NOT NULL REFERENCES Containers(Id),
  MergedByUserId      BIGINT      REFERENCES SharedUsers(Id),
  MergedAt            TIMESTAMPTZ NOT NULL DEFAULT NOW()
)

-- [NEW] Explicit presort queue — enables server-side aging queries and workload reporting
PresortQueue (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId           BIGINT       NOT NULL REFERENCES SharedCompanies(Id),
  DonationId          BIGINT       NOT NULL UNIQUE REFERENCES Donations(Id),
  StoreId             BIGINT       NOT NULL REFERENCES Stores(Id),
  AssignedToUserId    BIGINT       REFERENCES SharedUsers(Id),
  ContainerId         BIGINT       REFERENCES Containers(Id),           -- container assigned during presort
  Status              VARCHAR(20)  NOT NULL DEFAULT 'Queued',           -- PresortStatus enum
  ReceivedAt          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  StartedAt           TIMESTAMPTZ,                                      -- set when Status → InProgress
  CompletedAt         TIMESTAMPTZ                                      -- set when Status → Completed
)
```

---

### Loyalty Rewards

```sql
RewardDefinitions (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId               BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber         VARCHAR(20)     UNIQUE NOT NULL,
  Name                    VARCHAR(200)    NOT NULL,
  Description             TEXT,
  PointsRequired          INT             NOT NULL,
  RewardType              VARCHAR(20)     NOT NULL,                     -- RewardType enum
  Value                   DECIMAL(10,2)   NOT NULL,
  ValidFrom               DATE,
  ValidTo                 DATE,
  Status                  VARCHAR(20)     NOT NULL DEFAULT 'Active',   -- Status enum
  MinDonorTier            VARCHAR(20),                                  -- DonorTier enum; NULL = any tier can redeem
  IsGiftable              BOOLEAN         NOT NULL DEFAULT FALSE,
  MaxRedemptionsPerUser   INT,                                          -- NULL = unlimited
  TotalRedemptionLimit    INT,                                          -- NULL = unlimited
  TotalRedemptions        INT             NOT NULL DEFAULT 0            -- denormalized
)

RewardTransactions (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId         BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber   VARCHAR(20)     UNIQUE NOT NULL,
  DonorId           BIGINT          NOT NULL REFERENCES Donors(Id),
  RewardId          BIGINT          NOT NULL REFERENCES RewardDefinitions(Id),
  PointsUsed        INT             NOT NULL,
  Status            VARCHAR(20)     NOT NULL DEFAULT 'Pending',         -- RedemptionStatus enum
  VoucherCode       VARCHAR(100),
  -- Gifting: two rows are written for a gift (one for gifter, one for recipient)
  IsGift            BOOLEAN         NOT NULL DEFAULT FALSE,
  GiftedToId        BIGINT          REFERENCES Donors(Id),              -- set on gifter's row
  GiftedFromId      BIGINT          REFERENCES Donors(Id),              -- set on recipient's row
  ApprovedAt        TIMESTAMPTZ,
  FulfilledAt       TIMESTAMPTZ,
  RejectedAt        TIMESTAMPTZ,
  CancelledAt       TIMESTAMPTZ,
  RejectionReason   TEXT
)

-- [NEW] Status-change audit trail for dispute resolution — append-only
RewardTransactionAuditLog (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- Append-only — LastModifiedAt/LastModifiedById will always be NULL
  CompanyId           BIGINT       NOT NULL REFERENCES SharedCompanies(Id),
  TransactionId       BIGINT       NOT NULL REFERENCES RewardTransactions(Id),
  OldStatus           VARCHAR(20),                                      -- RedemptionStatus enum
  NewStatus           VARCHAR(20)  NOT NULL,                            -- RedemptionStatus enum
  ChangedByUserId     BIGINT       REFERENCES SharedUsers(Id),
  Reason              TEXT,
  ChangedAt           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
)
```

---

### Campaigns

```sql
Campaigns (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- CreatedById (from base) replaces the former CreatedByUserId column
  CompanyId           BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  ReferenceNumber     VARCHAR(20)     UNIQUE NOT NULL,
  Name                VARCHAR(200)    NOT NULL,
  Description         TEXT,
  StartDate           DATE            NOT NULL,
  EndDate             DATE            NOT NULL,
  CampaignStatus      VARCHAR(20)     NOT NULL DEFAULT 'Draft',         -- CampaignStatus enum
  Channel             VARCHAR(20)     NOT NULL                          -- NotificationChannel enum
)

CampaignTargetCriteria (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId         BIGINT      NOT NULL REFERENCES SharedCompanies(Id),
  CampaignId        BIGINT      NOT NULL REFERENCES Campaigns(Id) ON DELETE CASCADE,
  DepartmentKey     VARCHAR(50),
  CategoryKey       VARCHAR(50),
  SubCategoryKey    VARCHAR(50),
  AttributeKey      VARCHAR(100),
  AttributeValue    VARCHAR(200)
)

-- One row per channel per campaign
CampaignTemplates (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId   BIGINT       NOT NULL REFERENCES SharedCompanies(Id),
  CampaignId  BIGINT       NOT NULL REFERENCES Campaigns(Id) ON DELETE CASCADE,
  Channel     VARCHAR(20)  NOT NULL,                                    -- NotificationChannel enum
  Subject     VARCHAR(500),
  Body        TEXT,
  Blocks      JSONB,                                                    -- EmailBlock[] (variable nested structure)
  UNIQUE (CampaignId, Channel)
)

-- Append-only notification send log
CampaignNotifications (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- Append-only — LastModifiedAt/LastModifiedById will always be NULL
  CompanyId         BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  CampaignId        BIGINT          NOT NULL REFERENCES Campaigns(Id),
  DonorId           BIGINT          NOT NULL REFERENCES Donors(Id),
  Channel           VARCHAR(20)     NOT NULL,                           -- NotificationChannel enum
  SentAt            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  Success           BOOLEAN         NOT NULL,
  FailureReason     TEXT,
  ExternalMessageId VARCHAR(100)                                        -- provider message ID for delivery correlation
)
```

---

### System Configuration

```sql
-- One row per store; each store has its own operational settings
-- Exception: FK primary key — does NOT inherit BaseAuditableEntity
AppConfig (
  StoreId                   BIGINT      PRIMARY KEY REFERENCES Stores(Id),
  CompanyId                 BIGINT      NOT NULL REFERENCES SharedCompanies(Id),  -- for RLS; derived from Stores.CompanyId
  IsCashAccepted            BOOLEAN     NOT NULL DEFAULT TRUE,
  AssociationWindowHours    INT         NOT NULL DEFAULT 24,
  PointsPerItem             INT         NOT NULL DEFAULT 10,
  PointsPerDollar           INT         NOT NULL DEFAULT 20,
  PointsCalcMethod          VARCHAR(20) NOT NULL DEFAULT 'PerItem',    -- PointsCalcMethod enum
  PointsExpiryDays          INT,                                       -- NULL = points never expire; drives expiry job
  MaxPointsPerDonation      INT,                                       -- NULL = no cap per donation
  RequireApproval           BOOLEAN     NOT NULL DEFAULT FALSE,
  EmailForReceipt           BOOLEAN     NOT NULL DEFAULT FALSE,
  EmailForLogin             BOOLEAN     NOT NULL DEFAULT FALSE,
  EmailForCampaigns         BOOLEAN     NOT NULL DEFAULT TRUE
)

-- Exception: composite PK — does NOT inherit BaseAuditableEntity
LoyaltyTierConfig (
  CompanyId           BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  Tier                VARCHAR(20)     NOT NULL,                         -- DonorTier enum
  Label               VARCHAR(50)     NOT NULL,
  MinDonations        INT             NOT NULL,
  PointsMultiplier    DECIMAL(4,2)    NOT NULL DEFAULT 1.0,
  Perks               JSONB,                                            -- string[]
  PRIMARY KEY (CompanyId, Tier)
)
```

---

## Entity Relationship Summary

```
SharedCompanies ──< StoreHours, TimeSlots, Donors, DonorBadges, LoyaltyPointTransactions
SharedCompanies ──< Donations, DonationItems, DonationCategories, Receipts, TaxReceipts
SharedCompanies ──< ContainerCapacity, Containers, ContainerContents, ContainerMerges, PresortQueue
SharedCompanies ──< RewardDefinitions, RewardTransactions, RewardTransactionAuditLog
SharedCompanies ──< Campaigns, CampaignTargetCriteria, CampaignTemplates, CampaignNotifications
SharedCompanies ──< AppConfig, LoyaltyTierConfig, DonorPreferences, ConsentLog, DonationRefunds

SharedUsers ──< Donors     (UserType = External; nullable for anonymous)
-- Internal users (staff) are identified by UserType = Internal directly on SharedUsers; no separate table

Stores ──  AppConfig     (1:1 — each store has its own config)
Stores ──< StoreHours
Stores ──< TimeSlots
Stores ──< Donors     (PreferredStoreId)
Stores ──< Donations
Stores ──< Containers
Stores ──< PresortQueue

Donors ──< DonorBadges
Donors ──< LoyaltyPointTransactions
Donors ──< Donations  (DonorId — set at check-in or post-payment; IsAssociatedLater flags late linking)
Donors ──< RewardTransactions (redeemer, GiftedToId, GiftedFromId)
Donors ──< Receipts
Donors ──< TaxReceipts
Donors ──< CampaignNotifications

Donations ──< DonationItems   (Scope = Items rows + Scope = Monetary rows)
Donations ──< DonationCategories  (pre-planned categories for scheduled visits)
Donations ──  Receipts        (1:1)
Donations ──  PresortQueue    (1:1)
Donations ──< Containers
TimeSlots ──< Donations       (scheduled/pickup bookings)

Departments ──< Categories ──< SubCategories
Categories  ──< DonationItems
Categories  ──< ContainerContents
Categories  ──< DonationCategories
Categories  ──< CampaignTargetCriteria

Containers ──< ContainerContents
Containers ──< ContainerMerges  (TargetContainerId + SourceContainerId)
Containers ──  Containers       (self-ref: ParentContainerId for splits)

RewardDefinitions ──< RewardTransactions
RewardTransactions ──< RewardTransactionAuditLog

Campaigns ──< CampaignTargetCriteria
Campaigns ──< CampaignTemplates
Campaigns ──< CampaignNotifications

SharedUsers ──< Campaigns          (CreatedByUserId)
SharedUsers ──< Containers         (PresortWorkerId)
SharedUsers ──< Donations          (AttendantId)
SharedUsers ──< PresortQueue       (AssignedToUserId)
SharedUsers ──< ContainerMerges    (MergedByUserId)
SharedUsers ──< RewardTransactionAuditLog (ChangedByUserId)
```

---

## API Design

**Base URL:** `/api/v1`
**Auth:** Bearer JWT (shared domain cookie forwarded as `Authorization` header)
**Timestamps:** UTC ISO 8601
```
**Soft deletes:** `DELETE` endpoints set `IsDeleted = true` (from `BaseAuditableEntity`) — no hard deletes. `Status` remains a separate business-state column.

---

### Donors

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Donors` | List — `?Query=&Tier=&StoreId=&Page=` |
| `POST` | `/Donors` | Create donor — links to an existing `Users` record (UserType=External) or creates an anonymous donor with no UserId |
| `GET` | `/Donors/{Id}` | Donor detail |
| `PUT` | `/Donors/{Id}` | Update donor — mutable fields: `PreferredStoreId`, `Status`. PII (name, email, phone) is on `SharedUsers` and updated via the platform user API |
| `DELETE` | `/Donors/{Id}` | Soft delete (Status = Inactive) |
| `GET` | `/Donors/{Id}/Donations` | Donation history — `?Year=&Status=&Method=&Page=` |
| `GET` | `/Donors/{Id}/Loyalty` | Points balance, tier, progress to next tier |
| `GET` | `/Donors/{Id}/LoyaltyPointTransactions` | Append-only points history — `?Page=` |
| `GET` | `/Donors/{Id}/RewardTransactions` | Reward redemption history |
| `GET` | `/Donors/{Id}/Badges` | Earned badges list |
| `GET` | `/Donors/{Id}/Receipts` | All receipts for donor |
| `GET` | `/Donors/{Id}/TaxReceipts` | Annual tax receipt summaries |

---

### Donations

Handles both **walk-in completions** and **scheduled/pickup appointments** in one resource.
Use `?Method=WalkIn`, `?Method=Scheduled`, or `?Method=Pickup` to filter by method.
Use `?Status=Scheduled` to get the appointment queue; `?Status=Completed` for processed donations.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Donations` | List — `?Status=&Method=&StoreId=&DonorId=&Date=&From=&To=&Page=` |
| `POST` | `/Donations` | Create — for walk-ins set Method=WalkIn; for appointments set Method=Scheduled/Pickup and scheduling fields |
| `GET` | `/Donations/{Id}` | Detail with items |
| `PUT` | `/Donations/{Id}` | Update donation — mutable fields: `Notes`, `ReceiptDelivery`, `ScheduledDate`, `TimeSlotId`, `Recurring`, `PickupAddress`, `ExpectedItemCount`, `Scope`. Not allowed after `Status = Completed` |
| `POST` | `/Donations/{Id}/Items` | Add item (Scope=Items) or monetary entry (Scope=Monetary) |
| `PUT` | `/Donations/{Id}/Items/{ItemId}` | Update item — mutable fields: `Quantity`, `Condition`, `EstimatedValuePerItem`, `Amount`, `PaymentMethod`, `CardTxnRef`, `CashTendered`, `ChangeGiven` |
| `DELETE` | `/Donations/{Id}/Items/{ItemId}` | Remove item |
| `POST` | `/Donations/{Id}/ChangeStatus` | Transition status — body: `{ TransitionTo, Reason? }`. Valid values: `CheckedIn` (donor arrives), `Completed` (creates Receipt, awards points, enqueues presort), `Cancelled` (Reason required), `NoShow` (scheduled only) |
| `POST` | `/Donations/{Id}/Associate` | Set `DonorId` on an anonymous donation (Req 1) within `AssociationWindowHours`; sets `IsAssociatedLater = true` and stamps `AssociatedAt` |

---

### Time Slots [NEW]

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/TimeSlots` | All slots — `?StoreId=` |
| `GET` | `/TimeSlots/Available` | Available slots with remaining capacity — `?StoreId=1&Date=2026-04-01` |
| `POST` | `/TimeSlots` | Create slot (Admin) |
| `PUT` | `/TimeSlots/{Id}` | Update slot — mutable fields: `StartTime`, `EndTime`, `MaxCapacity`, `Status` |

---

### Containers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Containers` | List — `?Status=&StoreId=&DeptKey=&Destination=&Page=` |
| `POST` | `/Containers` | Create container |
| `GET` | `/Containers/{Id}` | Detail with contents |
| `PUT` | `/Containers/{Id}` | Update container — mutable fields: `Destination`, `DeptKey`, `CatKey`, `PresortMethod`, `Notes`, `IsSeasonal`, `SeasonalTag` |
| `PUT` | `/Containers/{Id}/Contents` | Replace full contents list for container |
| `POST` | `/Containers/{Id}/ChangeStatus` | Transition status — body: `{ TransitionTo }`. Valid values: `Available`, `ReadyForSorting`, `Sorting`, `InUse`, `Closed` |
| `POST` | `/Containers/{Id}/Transfer` | Initiate transfer to another store |
| `POST` | `/Containers/Merge` | Merge list of containers into one target |
| `GET` | `/Containers/Barcode/{Barcode}` | Barcode lookup for presort scanner |

---

### Presort

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Presort/Queue` | Queue for current store — `?StoreId=&AssignedTo=` |
| `POST` | `/Presort/Queue/{DonationId}/Assign` | Assign container to donation |
| `POST` | `/Presort/Queue/{DonationId}/ChangeStatus` | Transition status — body: `{ TransitionTo }`. Valid values: `InProgress`, `Completed` |

---

### Rewards

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Rewards` | List definitions — `?Status=Active` |
| `POST` | `/Rewards` | Create reward (Admin) |
| `PUT` | `/Rewards/{Id}` | Update reward — mutable fields: `Name`, `Description`, `PointsRequired`, `Value`, `ValidFrom`, `ValidTo`, `MinDonorTier`, `IsGiftable`, `MaxRedemptionsPerUser`, `TotalRedemptionLimit` |
| `DELETE` | `/Rewards/{Id}` | Soft delete (Status = Inactive) |
| `GET` | `/RewardTransactions` | List all redemptions — `?DonorId=&Status=&Page=` |
| `POST` | `/RewardTransactions` | Redeem a reward |
| `POST` | `/RewardTransactions/{Id}/ChangeStatus` | Transition status — body: `{ TransitionTo, Reason? }`. Valid values: `Approved`, `Rejected` (Reason required), `Fulfilled`, `Cancelled` |
| `POST` | `/RewardTransactions/{Id}/Gift` | Gift to another donor — body: `{ RecipientDonorId }` |

---

### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Campaigns` | List — `?Status=&Page=` |
| `POST` | `/Campaigns` | Create campaign |
| `GET` | `/Campaigns/{Id}` | Detail |
| `PUT` | `/Campaigns/{Id}` | Update campaign — mutable fields: `Name`, `Description`, `StartDate`, `EndDate`, `Channel`. Only allowed when `CampaignStatus = Draft` or `Paused` |
| `PUT` | `/Campaigns/{Id}/Template` | Replace email or SMS template — body: `{ Channel, Subject?, Body?, Blocks? }` |
| `DELETE` | `/Campaigns/{Id}` | Soft delete |
| `POST` | `/Campaigns/{Id}/ChangeStatus` | Transition status — body: `{ TransitionTo }`. Valid values: `Active`, `Paused`, `Completed` |
| `GET` | `/Campaigns/{Id}/PreviewAudience` | Matching donor count + sample before send |
| `POST` | `/Campaigns/{Id}/Send` | Trigger notification run |
| `GET` | `/Campaigns/{Id}/Notifications` | Send history — `?Page=` |

---

### Receipts [NEW]

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Receipts` | List — `?DonorId=&Year=&Page=` |
| `GET` | `/Receipts/{Id}` | Detail |
| `POST` | `/Receipts/{Id}/Email` | Re-send receipt by email |
| `GET` | `/Receipts/{Id}/Download` | PDF download |
| `GET` | `/TaxReceipts` | Annual summaries — `?DonorId=&Year=` |
| `POST` | `/TaxReceipts/Generate` | Trigger year-end generation (Admin) |
| `POST` | `/TaxReceipts/{Id}/Send` | Send tax receipt to donor |

---

### Stores

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Stores` | List all stores |
| `GET` | `/Stores/{Id}` | Store detail |
| `GET` | `/Stores/{Id}/Stats` | Today's donations, items, revenue |
| `GET` | `/Stores/{Id}/Hours` | Structured hours (StoreHours rows) |
| `PUT` | `/Stores/{Id}/Hours` | Replace full week schedule — body: array of `{ DayOfWeek, OpenTime, CloseTime, IsClosed }` |

---

### Taxonomy

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Taxonomy/Departments` | Full tree: Department → Category → SubCategory |
| `GET` | `/Taxonomy/Departments/{Key}` | Single department with its categories |

---

### Configuration

`AppConfig` is per-store. All config endpoints are scoped under `/Stores/{StoreId}`.
`LoyaltyTierConfig` and `ContainerCapacity` remain global (platform-wide).

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Stores/{StoreId}/Config` | Get store AppConfig |
| `PUT` | `/Stores/{StoreId}/Config` | Update store AppConfig (Manager+) — all fields are mutable |
| `GET` | `/Config/LoyaltyTiers` | All tier configurations (global) |
| `PUT` | `/Config/LoyaltyTiers/{Tier}` | Update tier thresholds, multiplier, perks (Admin) |
| `GET` | `/Config/ContainerCapacity` | Max items per container type (global) |
| `PUT` | `/Config/ContainerCapacity/{ContainerType}` | Update max items for a container type (Admin) |

---

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Analytics/Summary` | AnalyticsSummary — trends, category breakdown, top stores |
| `GET` | `/Analytics/Donations` | Donations over time — `?GroupBy=Day\|Week\|Month&From=&To=` |
| `GET` | `/Analytics/Donors` | New vs repeat donors, tier distribution |
| `GET` | `/Analytics/Presort` | Queue aging, avg completion time per worker/store |
| `GET` | `/Analytics/Rewards` | Redemption rates, popular rewards, points outstanding |

---

### Users (session)

Internal user identity is managed entirely by the platform (roles, permissions, credentials).
The donation API exposes only the session bootstrap endpoint.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/SharedUsers/Me` | Current user session from JWT — returns `Id`, `UserType`, resolved `DonorId` (if External) |

---

## Improvements over POC

### Schema Improvements

| # | Change | Reason |
|---|--------|--------|
| 1 | **`UserType` on `Users`** | Extends the existing auth table to cover donor self-service accounts (External) alongside internal platform users, eliminating any need for a separate credential store. |
| 2 | **No `Staff` table; no predefined roles** | Internal users are identified by `UserType = Internal` on `Users` directly. Roles and permissions are handled by the platform's existing custom-role system — no `StaffRole` enum or Staff table needed. `Donors.UserId` is nullable to support anonymous walk-ins. |
| 3 | **`Donations` + `ScheduledDonations` merged** | `DonationMethod` (WalkIn / Scheduled / Pickup) already distinguishes the type; `DonationStatus` covers the full lifecycle (Scheduled → CheckedIn → Completed). Scheduling fields (`ScheduledDate`, `TimeSlotId`, `Recurring`, `PickupAddress`) are nullable and only populated when relevant. |
| 4 | **`DonationItems` + `MonetaryDonations` merged** | A `Scope` column per row (Items / Monetary) keeps the table unified. Item-type rows carry category/quantity/condition fields; monetary rows carry amount/payment fields. A `Both`-scope donation has rows of each type. |
| 5 | **`StoreHours` table** | Replaces the unstructured `Hours: string` on `Stores` with structured Mon–Sun open/close rows, enabling server-side "is this store open now?" checks. |
| 6 | **`TimeSlots` table** | Replaces the hardcoded `['9:00 AM' … '5:00 PM']` array in the scheduler UI. Adds `MaxCapacity` per slot for overbooking prevention. |
| 7 | **`LoyaltyPointTransactions` table** | Replaces a single balance column with an append-only credit/debit log. Enables point expiry, dispute resolution, and the per-donation delta view already in the donor portal. |
| 8 | **`Receipts` + `TaxReceipts` tables** | Explicit receipt records with delivery timestamps. `TaxReceipts` tracks annual roll-up generation and sent status already displayed in the donor portal receipts tab. |
| 9 | **`DonorBadges` table** | Stores earned badges with `EarnedAt` timestamps. The donor dashboard already renders badge cards — without this table they cannot be persisted or queried. |
| 10 | **`PresortQueue` table** | Explicit queue rows with `AssignedToStaffId`, `StartedAt`, `CompletedAt` enable server-side queue aging and workload reporting — currently computed client-side only. |
| 11 | **`ContainerCapacity` table** | Config-driven max items per type replaces hardcoded `{ Gaylord: 400, CartRack: 80 … }` in `containers.component.ts`. |
| 12 | **`RewardTransactionAuditLog` table** | Captures every status transition with staff ID and reason for dispute resolution. |

### API Improvements

| # | Change | Reason |
|---|--------|--------|
| 1 | **Single `/Donations` resource** | Scheduled appointments and walk-in completions share one endpoint family; `?Method=` and `?Status=` filter to the right view. Eliminates a parallel `/ScheduledDonations` surface. |
| 2 | **`POST /Donations/{Id}/ChangeStatus`** | Single status-transition endpoint with `TransitionTo` in the body covers CheckedIn, Completed, Cancelled, and NoShow — one surface instead of four named actions. |
| 3 | **`GET /TimeSlots/Available`** | Returns open slots with remaining capacity so the schedule UI can disable fully-booked times — not possible with hardcoded strings. |
| 4 | **`GET /Donors/{Id}/LoyaltyPointTransactions`** | Surfaces points history as a first-class resource; the donor portal rewards view already renders per-entry deltas. |
| 5 | **`GET /Receipts` + `GET /TaxReceipts`** | Top-level receipt endpoints align with the donor portal receipts tab; avoids burying them as donation sub-resources. |
| 6 | **`POST /Donations/{Id}/Associate`** | Sets `DonorId` on an anonymous donation within `AssociationWindowHours`. Uses the same `DonorId` column — no separate `AssociatedDonorId` needed. `IsAssociatedLater` flag and `AssociatedAt` timestamp record that the link happened post-completion. |
| 7 | **Consistent pagination envelope** | All list endpoints return `{ Data, TotalCount, Page, PageSize }`. The POC uses unbounded in-memory arrays. |
| 8 | **`GET /Campaigns/{Id}/PreviewAudience`** | Returns matching donor count before triggering a send, preventing accidental mass notifications. |
| 9 | **Soft deletes via `IsDeleted`** | `DELETE` endpoints set `IsDeleted = true` from `BaseAuditableEntity` — no hard deletes. `Status` is a separate business-state field. |
| 10 | **`GET /Users/Me`** | Session bootstrap endpoint returns `UserType` and resolved `DonorId`; avoids embedding user identity in every request body. |

---

## Production Readiness Gaps

Items below must be addressed before the schema is considered production-ready.
Inline fixes (column additions, renames) have already been applied to the tables above.
New tables and cross-cutting concerns are documented here.

---

### A. Indexes

No indexes are defined yet. Every FK column and commonly-filtered column needs one.

```sql
-- CompanyId on every table (for row-level security and multi-tenant filtering)
CREATE INDEX IX_Donors_CompanyId                    ON Donors(CompanyId);
CREATE INDEX IX_LoyaltyPointTransactions_CompanyId  ON LoyaltyPointTransactions(CompanyId);
CREATE INDEX IX_Donations_CompanyId                 ON Donations(CompanyId);
CREATE INDEX IX_DonationItems_CompanyId             ON DonationItems(CompanyId);
CREATE INDEX IX_Containers_CompanyId                ON Containers(CompanyId);
CREATE INDEX IX_PresortQueue_CompanyId              ON PresortQueue(CompanyId);
CREATE INDEX IX_RewardDefinitions_CompanyId         ON RewardDefinitions(CompanyId);
CREATE INDEX IX_RewardTransactions_CompanyId        ON RewardTransactions(CompanyId);
CREATE INDEX IX_Campaigns_CompanyId                 ON Campaigns(CompanyId);
CREATE INDEX IX_CampaignNotifications_CompanyId     ON CampaignNotifications(CompanyId);

-- Donors
CREATE INDEX IX_Donors_UserId        ON Donors(UserId);
CREATE INDEX IX_Donors_LoyaltyTier   ON Donors(LoyaltyTier);
CREATE INDEX IX_Donors_Status        ON Donors(Status);

-- Donations
CREATE INDEX IX_Donations_DonorId        ON Donations(DonorId);
CREATE INDEX IX_Donations_StoreId        ON Donations(StoreId);
CREATE INDEX IX_Donations_Status         ON Donations(Status);
CREATE INDEX IX_Donations_Method         ON Donations(Method);
CREATE INDEX IX_Donations_ScheduledDate  ON Donations(ScheduledDate);
CREATE INDEX IX_Donations_AssocLater     ON Donations(IsAssociatedLater) WHERE IsAssociatedLater = TRUE;

-- DonationItems
CREATE INDEX IX_DonationItems_DonationId ON DonationItems(DonationId);

-- LoyaltyPointTransactions
CREATE INDEX IX_LoyaltyPointTransactions_DonorId     ON LoyaltyPointTransactions(DonorId);
CREATE INDEX IX_LoyaltyPointTransactions_ExpiresAt   ON LoyaltyPointTransactions(ExpiresAt) WHERE ExpiresAt IS NOT NULL;

-- RewardTransactions
CREATE INDEX IX_RewardTxn_DonorId   ON RewardTransactions(DonorId);
CREATE INDEX IX_RewardTxn_RewardId  ON RewardTransactions(RewardId);
CREATE INDEX IX_RewardTxn_Status    ON RewardTransactions(Status);

-- Containers
CREATE INDEX IX_Containers_StoreId    ON Containers(StoreId);
CREATE INDEX IX_Containers_Status     ON Containers(Status);
CREATE INDEX IX_Containers_DonationId ON Containers(DonationId);

-- PresortQueue
CREATE INDEX IX_PresortQueue_StoreId          ON PresortQueue(StoreId);
CREATE INDEX IX_PresortQueue_AssignedToUserId ON PresortQueue(AssignedToUserId);
CREATE INDEX IX_PresortQueue_CompletedAt      ON PresortQueue(CompletedAt) WHERE CompletedAt IS NULL;

-- CampaignNotifications
CREATE INDEX IX_CampNotif_CampaignId ON CampaignNotifications(CampaignId);
CREATE INDEX IX_CampNotif_DonorId    ON CampaignNotifications(DonorId);
```

---

### B. CHECK Constraints

Business rules enforced at the database layer — not solely in application code.

```sql
ALTER TABLE DonationItems
  ADD CONSTRAINT CHK_DonationItems_Quantity CHECK (Quantity IS NULL OR Quantity > 0),
  ADD CONSTRAINT CHK_DonationItems_Amount   CHECK (Amount IS NULL OR Amount > 0);

ALTER TABLE Donations
  ADD CONSTRAINT CHK_Donations_Association
    CHECK (AssociatedAt IS NULL OR IsAssociatedLater = TRUE);

ALTER TABLE Campaigns
  ADD CONSTRAINT CHK_Campaigns_Dates CHECK (EndDate >= StartDate);

ALTER TABLE RewardDefinitions
  ADD CONSTRAINT CHK_RewardDef_Validity
    CHECK (ValidFrom IS NULL OR ValidTo IS NULL OR ValidTo >= ValidFrom),
  ADD CONSTRAINT CHK_RewardDef_Points CHECK (PointsRequired > 0);

ALTER TABLE TimeSlots
  ADD CONSTRAINT CHK_TimeSlots_Times CHECK (EndTime > StartTime);

ALTER TABLE LoyaltyPointTransactions
  ADD CONSTRAINT CHK_LoyaltyPointTransactions_Delta CHECK (Delta != 0);
```

---

### C. New Tables

#### DonorPreferences
Tracks per-donor communication opt-in/out. Required for GDPR / CAN-SPAM compliance.
Campaign sends must check `CampaignOptIn = TRUE` before targeting a donor.

```sql
-- Exception: FK primary key — does NOT inherit BaseAuditableEntity
DonorPreferences (
  DonorId             BIGINT          PRIMARY KEY REFERENCES Donors(Id) ON DELETE CASCADE,
  CompanyId           BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  EmailOptIn          BOOLEAN         NOT NULL DEFAULT TRUE,
  SmsOptIn            BOOLEAN         NOT NULL DEFAULT TRUE,
  CampaignOptIn       BOOLEAN         NOT NULL DEFAULT TRUE,
  PreferredChannel    VARCHAR(20)                            -- NotificationChannel enum; NULL = no preference
)
```

#### ConsentLog
Immutable audit trail of every consent change. Required for GDPR accountability obligation.

```sql
-- Append-only — LastModifiedAt/LastModifiedById will always be NULL
ConsentLog (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  CompanyId   BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  DonorId     BIGINT          NOT NULL REFERENCES Donors(Id),
  Field       VARCHAR(50)     NOT NULL,         -- 'EmailOptIn', 'SmsOptIn', 'CampaignOptIn'
  OldValue    BOOLEAN,
  NewValue    BOOLEAN         NOT NULL,
  Source      VARCHAR(50)     NOT NULL,         -- 'DonorPortal', 'StaffOverride', 'Import'
  IpAddress   VARCHAR(45),
  ChangedAt   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
)
```

> No updates or deletes on this table — append-only.

#### DonationRefunds
Records full or partial refunds on monetary donations.
On refund, also write a `LoyaltyPointTransactions` debit (`Reason = RedemptionDebit`) for any points awarded on the original donation.

```sql
-- Append-only — LastModifiedAt/LastModifiedById will always be NULL
DonationRefunds (
  -- BaseAuditableEntity: Id, CreatedAt, CreatedById, LastModifiedAt, LastModifiedById, IsDeleted
  -- ProcessedByUserId is captured via CreatedById from base
  CompanyId           BIGINT          NOT NULL REFERENCES SharedCompanies(Id),
  DonationId          BIGINT          NOT NULL REFERENCES Donations(Id),
  Amount              DECIMAL(12,2)   NOT NULL CHECK (Amount > 0),
  Reason              TEXT,
  RefundTxnRef        VARCHAR(100)                -- card processor refund reference
)
```

---

### D. Missing Stores Column

`Stores` is an existing table. Add a `Timezone` column to support multi-timezone store networks.
Without this, scheduled `TimeSlots` are ambiguous when stores are in different timezones.

```sql
ALTER TABLE Stores
  ADD COLUMN Timezone VARCHAR(50) NOT NULL DEFAULT 'UTC';  -- IANA tz name e.g. 'America/Chicago'
```

---

### E. API Additions

#### Idempotency
The following endpoints **must** accept an `Idempotency-Key: <uuid>` request header.
The server stores the key + response for 24 hours and replays it on retry — preventing duplicate
payments, double point awards, or duplicate redemptions on network failures.

| Endpoint | Why |
|----------|-----|
| `POST /Donations/{Id}/ChangeStatus` | Prevents double point award / double receipt when `TransitionTo = Completed` |
| `POST /RewardTransactions` | Prevents duplicate redemption |
| `POST /Donations/{Id}/Associate` | Prevents double donor linking |
| `POST /Donations/{Id}/Refund` | Prevents double refund |

#### Rate Limiting
All write endpoints are rate-limited per authenticated user. Response headers:

```
X-RateLimit-Limit:     100
X-RateLimit-Remaining: 97
X-RateLimit-Reset:     1711929600
```

Return `HTTP 429 Too Many Requests` with `Retry-After` header when limit exceeded.

#### Donor Preferences & GDPR

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Donors/{Id}/Preferences` | Get communication opt-in settings |
| `PUT` | `/Donors/{Id}/Preferences` | Update opt-in/out — writes `ConsentLog` entry for every changed field |
| `POST` | `/Donors/{Id}/Anonymise` | GDPR right-to-erasure — replaces PII with anonymised values; preserves financial audit trail (ledger, receipts) |

#### Refunds

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Donations/{Id}/Refunds` | List refunds on a donation |
| `POST` | `/Donations/{Id}/Refund` | Issue full or partial refund (Manager+); reverses points via `LoyaltyPointTransactions` |

#### Points Expiry Config

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/Stores/{StoreId}/Config` | Returns full `AppConfig` including `PointsExpiryDays` and `MaxPointsPerDonation` |

---

### F. Schema Consistency (applied inline above)

The following were fixed directly in the table definitions:

| Table | Change |
|-------|--------|
| `Donations` | `Status` default removed — set explicitly by API per Method |
| `Donations` | `Timestamp` renamed to `DonationAt`; added `CancellationReason`, `CancelledByUserId` |
| `DonationItems` | Added `UpdatedAt` |
| `PresortQueue` | Added `ContainerId FK → Containers` |
| `RewardDefinitions` | Added `MinDonorTier` — tier-gated reward access |
| `LoyaltyPointTransactions` | Added `ExpiresAt` — drives expiry job and "points expiring soon" alerts |
| `AppConfig` | Added `PointsExpiryDays`, `MaxPointsPerDonation` |
| `CampaignNotifications` | Added `ExternalMessageId` — correlates with email/SMS provider delivery logs |
| All tables | Added `CompanyId INT NOT NULL REFERENCES SharedCompanies(Id)` for multi-tenancy and row-level security |
| `ContainerCapacity` | PK changed from `ContainerType` to composite `(CompanyId, ContainerType)` |
| `LoyaltyTierConfig` | PK changed from `Tier` to composite `(CompanyId, Tier)` |
