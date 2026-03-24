# Brijjworks Donation App

Angular 20 standalone-component application for managing thrift store donations across two portals.

## Quick Start

```bash
npm install
npm start             # http://localhost:4200
```

## Build

```bash
npm run build -- --configuration=development
npm run build -- --configuration=staging
npm run build -- --configuration=production
```

## Test & Format

```bash
npm test
npm run format
```

## Project Structure

```
src/app/
  core/                                    # Singleton services, interceptors, guards, shared models
    guards/                                # staffTokenGuard, donorAuthGuard
    interceptors/                          # AuthInterceptor (JWT Bearer + refresh queue)
    models/
      domain.models.ts                     # Shared enums, interfaces, label maps
      async-status.type.ts                 # AsyncStatus type
    services/
      auth.service.ts                      # JWT cookie auth
      mock-data.service.ts                 # Development seed data
      storage.service.ts                   # localStorage persistence
      toast.service.ts                     # Signal-based toast queue
  shared/                                  # Reusable components (icon, modal, toast, qr-code, layouts)
  modules/
    staff-portal/                          # /staff routes
      features/
        new-donation/                      # Multi-step donation wizard
        donations/                         # Scheduled + completed donations
        presort/                           # Container presort workflow
        containers/                        # Container lifecycle management
        admin-dashboard/                   # Analytics & store status
        donors/                            # Donor CRUD & profiles
        settings/                          # System config, loyalty tiers, rewards
        campaigns/                         # Email/SMS campaign builder
    donor-portal/                          # /donor routes
      features/
        dashboard/                         # Loyalty hero, impact, quick actions
        history/                           # Donation history with filters
        receipts/                          # Tax receipt download & email
        rewards/                           # Points redemption & gifting
        schedule/                          # Schedule future donations
```

### Feature Structure (every feature follows this pattern)

```
features/<feature-name>/
  pages/                                   # Container components (route-level)
    feature-page.component.ts|html|scss
  components/                              # Presentational components
    component-name/
      component-name.component.ts|html|scss
  services/
    feature.service.ts
  models/                                  # Flat — no sub-folders
    feature.state.ts                       # UI binding models
    feature.request.ts                     # API request contracts
    feature.response.ts                    # API response contracts
    feature.mapper.ts                      # Pure mapping functions
    feature.enum.ts                        # Feature-specific enums
```

## Architecture

- **Angular 20** — Standalone components, no NgModules
- **Signals-first** — `signal()`, `computed()`, `input()`, `output()`, `model()`
- **Container/Presentational** — Pages own state + side effects; components are pure UI
- **UI-State-Mapper-API** — All data flows through mappers as pure functions
- **OnPush** — Every component uses `ChangeDetectionStrategy.OnPush`
- **Lazy loading** — All feature routes lazy-loaded via `loadComponent`

## Path Aliases

| Alias | Path |
|-------|------|
| `@app/*` | `src/app/*` |
| `@core/*` | `src/app/core/*` |
| `@shared/*` | `src/app/shared/*` |
| `@staff/*` | `src/app/modules/staff-portal/features/*` |
| `@donor/*` | `src/app/modules/donor-portal/features/*` |

## Authentication

Two separate auth flows for the two portals:

- **Staff Portal** — Token from Company app SSO (simulated in dev via `DevAuthService`)
- **Donor Portal** — Direct login with email/password (simulated in dev via `DevAuthService`)

Both portals use JWT tokens stored in cookies, role-based route guards, and `CurrentUserService` for reactive user context. See the auth docs below for full flow details.

## Environments

| Environment | API Domain |
|-------------|-----------|
| Development | `*.dev.rcscbs.com` |
| Staging | `*.stg.rcscbs.com` |
| Production | `*.brijjworks.com` |

## Code Style

- **Prettier**: 120 char width, 2-space indent, single quotes (TS), double quotes (SCSS)
- **TypeScript**: `strict: true`, strict templates, strict injection
- **SCSS**: Component-scoped, CSS Custom Properties design system

## Documentation

| Document | Description |
|----------|-------------|
| [UI Guidelines SOP](docs/UI_GUIDELINES.md) | Coding agent SOP — components, services, models, mappers (v3.0) |
| [Staff Portal Auth](docs/AUTH_STAFF_PORTAL.md) | Staff authentication flow, guards, JWT structure, session lifecycle |
| [Donor Portal Auth](docs/AUTH_DONOR_PORTAL.md) | Donor authentication flow, identity resolution, cross-portal protection |
| [Security Guidelines](docs/SECURITY_GUIDELINES.md) | XSS prevention, CSP, cookie security, input validation, error handling |
| [CLAUDE.md](CLAUDE.md) | Claude Code configuration and project context |
