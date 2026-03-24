# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
npm start

# Build (specify environment via --configuration)
npm run build -- --configuration=development
npm run build -- --configuration=staging
npm run build -- --configuration=production

# Run tests
npm test

# Run a single test file
npx ng test --include='**/path/to/component.spec.ts'

# Watch mode build
npm run watch

# Format code (Prettier)
npm run format
```

## Architecture Overview

**Angular 20 standalone-component application** with no NgModules. Uses `bootstrapApplication()` with `app.config.ts`.

### Two-Portal Structure

The app has two completely separate portals with their own layouts, guards, and routes:

- **Staff Portal** (`/staff`) — Operations: new-donation, donations, presort, containers, dashboard, donors, settings, campaigns
- **Donor Portal** (`/donor`) — Self-service: dashboard, history, receipts, rewards, schedule

Both portals lazy-load their child routes. The `staff-layout` and `donor-layout` shared components provide the shell UI for each portal.

### Feature Architecture (Container/Presentational)

Every feature follows the **UI-State-Mapper-API** architecture defined in [docs/UI_GUIDELINES.md](docs/UI_GUIDELINES.md):

```
modules/<portal>/features/<feature-name>/
  pages/           # Container (route-level) components — inject service, own signals
  components/      # Presentational components — input()/output() only, no service injection
  services/        # Feature service — calls mappers, returns State models
  models/          # FLAT folder — no sub-folders
    feature.state.ts       # UI binding models
    feature.request.ts     # API request contracts
    feature.response.ts    # API response contracts
    feature.mapper.ts      # Pure mapping functions
    feature.enum.ts        # Feature-specific enums/constants
```

**Hard rules:**
- Every component = 3 separate files (.ts, .html, .scss) — never inline templates/styles
- All components use `ChangeDetectionStrategy.OnPush`
- Signal-based `input()` / `output()` / `model()` — never `@Input()` / `@Output()`
- `inject()` function — never constructor injection
- Services call mapper functions — no inline mapping logic
- Page components own the topbar — presentational components never render their own

### Path Aliases (tsconfig.json)

```
@app/*    → src/app/*
@core/*   → src/app/core/*
@shared/* → src/app/shared/*
@staff/*  → src/app/modules/staff-portal/features/*
@donor/*  → src/app/modules/donor-portal/features/*
```

### Authentication Model

This is a **token-consuming app** — it does not have its own login flow. Users authenticate via the Company app (separate service at `companyUrl`) which sets a JWT in a **domain-scoped cookie** shared across the `*.rcscbs.com` / `*.brijjworks.com` subdomain family.

- `AuthService` reads/validates the shared JWT cookie and handles token refresh
- `AuthInterceptor` attaches Bearer tokens and manages a refresh queue to prevent race conditions on 401s
- `staffTokenGuard` and `donorAuthGuard` protect their respective portals
- Login redirect goes to `companyUrl/login` with a `returnUrl` parameter

### Authentication & Session

Two separate auth flows:
- **Staff Portal** — Token from Company app SSO (simulated in dev via `DevAuthService`)
- **Donor Portal** — Direct login with email/password (simulated in dev via `DevAuthService`)

Key services:
- **`AuthService`** — JWT cookie CRUD, token decode (cached), expiry check with 10s buffer
- **`DevAuthService`** — Dev-only mock JWT generation for both portals
- **`CurrentUserService`** — Reactive user context (portal, donor/staff identity, displayName, initials, email)
- **`staffAuthGuard`** / **`donorAuthGuard`** — Role-based route guards (JWT + role validation)
- **`AuthInterceptor`** — Bearer header injection, 401 token refresh, portal-aware redirect, 30s timeout

Session rules:
- Login clears any previous session before creating a new one
- Guards enforce role isolation (donor can't access staff portal and vice versa)
- Login pages auto-redirect if already authenticated with correct role
- Sign out clears all cookies + storage + cache

### State & Data

- **`MockDataService`** provides all seed data in development. It is the single source of truth for domain objects.
- **Feature services** wrap `MockDataService`, calling mapper functions to return State models.
- **`StorageService`** persists mock data to `localStorage` with version management.
- Angular **Signals** are used for reactive state. No global state library (NgRx/Akita).

### Core Domain Models

All shared enums, label maps, and interfaces are in [src/app/core/models/domain.models.ts](src/app/core/models/domain.models.ts). Key concepts:
- **Donor** with loyalty points and `DonorTier` (Bronze/Silver/Gold/Platinum)
- **Donation** → **DonationItem** → **Container** pipeline
- **RewardDefinition** / **RewardTransaction** for the loyalty rewards system
- **Campaign** with block-based email builder (`EmailBlock[]`) and `CampaignTargetCriteria`
- **AppConfig** controls system-wide toggles
- **AsyncStatus** type in [src/app/core/models/async-status.type.ts](src/app/core/models/async-status.type.ts)

### Environments

Three environments map to different API domains:
- `development` → `*.dev.rcscbs.com`
- `staging` → `*.stg.rcscbs.com`
- `production` → `*.brijjworks.com`

All environments share the same shape: `donationApiUrl`, `companyApiUrl`, `companyUrl`, `tpmUrl`, `listerUrl`, `posUrl`, `imsUrl`, etc.

## Code Style

- **Prettier** enforced: print width 120, 2-space indent, single quotes in TS, double quotes in SCSS, no trailing commas
- **Strict TypeScript**: `strict: true`, strict Angular template checking, strict injection
- **Default standalone: true** for all generated components (set in `angular.json`)
- Component styles default to **SCSS**

## Reference

- [UI Guidelines SOP](docs/UI_GUIDELINES.md) — Coding agent SOP for components, services, models, mappers (v3.0)
- [Staff Portal Auth](docs/AUTH_STAFF_PORTAL.md) — Staff authentication flow, guards, JWT structure, session lifecycle
- [Donor Portal Auth](docs/AUTH_DONOR_PORTAL.md) — Donor authentication flow, identity resolution, cross-portal protection
- [Security Guidelines](docs/SECURITY_GUIDELINES.md) — XSS prevention, CSP, cookie security, input validation, error handling
