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

- **Staff Portal** (`/staff`) — Operations: donations, presort, containers, donor management, campaigns, settings
- **Donor Portal** (`/donor`) — Self-service: dashboard, donation history, receipts, loyalty rewards, scheduling

Both portals lazy-load their child routes. The `staff-layout` and `donor-layout` shared components provide the shell UI for each portal.

### Authentication Model

This is a **token-consuming app** — it does not have its own login flow. Users authenticate via the Company app (separate service at `companyUrl`) which sets a JWT in a **domain-scoped cookie** shared across the `*.rcscbs.com` / `*.brijjworks.com` subdomain family.

- `AuthService` reads/validates the shared JWT cookie and handles token refresh
- `AuthInterceptor` attaches Bearer tokens and manages a refresh queue to prevent race conditions on 401s
- `staffTokenGuard` and `donorAuthGuard` protect their respective portals using `sessionStorage` flags (currently simulated — see TODO comments in guards)
- Login redirect goes to `companyUrl/login` with a `returnUrl` parameter

### State & Data

- **`MockDataService`** provides all seed data in development. It is the single source of truth for domain objects (donors, donations, containers, locations, rewards, campaigns).
- **`StorageService`** persists mock data to `localStorage` with version management.
- Angular **Signals** are used for reactive state (e.g., `ToastService` uses signals for toast queue).
- No global state library (NgRx/Akita). State lives in services.

### Core Domain Models ([src/app/core/models/domain.models.ts](src/app/core/models/domain.models.ts))

All enums, label maps, and interfaces are centralized here. Key concepts:
- **Donor** with loyalty points and `DonorTier` (Bronze/Silver/Gold/Platinum)
- **Donation** → **DonationItem** → **Container** pipeline
- **RewardDefinition** / **RewardTransaction** for the loyalty rewards system
- **Campaign** with block-based email builder (`EmailBlock[]`) and `CampaignTargetCriteria`
- **AppConfig** controls system-wide toggles (cash acceptance, points calculation method, approval requirements)

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
