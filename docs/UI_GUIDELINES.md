# Angular Coding Agent SOP

**For Components, Services, State Models, Requests, Responses & Mappers**

- **Version:** 3.0
- **Angular:** 20 (Standalone, Signals-first)
- **Architecture:** UI-State-Mapper-API
- **Audience:** Angular Coding Agents

---

## 1. Component Rules

### 1.1 Single Responsibility

- Each component must represent a single UI responsibility.
- Never mix independent visual or logical parts into one component.

### 1.2 Container vs. Presentational Components

**Container Components (Pages / Route-level)**

- Live in `pages/` directory
- Inject feature service(s) — never inject `MockDataService` or raw data sources directly
- Manage state via signals
- Trigger side effects (toasts, navigation, modal visibility)
- Handle page-level events
- Orchestrate child presentational components
- Own the topbar (title, subtitle, search/filters in `topbar-actions`)

**Presentational Components**

- Live in `components/` directory (one subfolder per component)
- Receive data via `input()` signals
- Emit events via `output()`
- Render UI only
- No data-fetching service injection (utility services like `Router`, `DestroyRef` are allowed)
- No business logic

### 1.3 Component Standards

- Use standalone components (default in Angular 20)
- Use `OnPush` change detection on **every** component
- Use `inject()` function for dependency injection (not constructor injection)
- Use strict typing
- **Every component must have 3 separate files** — never inline templates or styles:
  - `component-name.component.ts` — uses `templateUrl` and `styleUrl`
  - `component-name.component.html`
  - `component-name.component.scss`
- If a component handles more than one user-facing concern, split it. Use ~250 lines as a smell indicator, not a hard rule.

```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss',
})
export class ProductCardComponent {
  // Preferred DI pattern
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Avoid: constructor injection
  // constructor(private productService: ProductService) {}
}
```

### 1.4 Naming Rules

- **Folder:** kebab-case
- **Class:** PascalCase
- **Suffix:** `Component`

```
product-card/
  product-card.component.ts
  product-card.component.html
  product-card.component.scss
  product-card.component.spec.ts
```

### 1.5 Inputs & Outputs (Signal-Based)

Use Angular's signal-based `input()` and `output()` APIs. Decorator-based `@Input()` / `@Output()` are deprecated.

```typescript
// Required input
name = input.required<string>();

// Optional input with default
pageSize = input<number>(10);

// Output
updated = output<ProductState>();

// Two-way binding
value = model<string>('');
```

- If inputs exceed 5, consider a single config object input or splitting the component — whichever reduces complexity.

### 1.6 Keep Maximum Nesting to 3 Levels

`Page → Section → Item` (max allowed)

### 1.7 Page Layout Pattern

All page components follow a consistent layout structure:

```html
<!-- Topbar: owned by the page, not by child components -->
<div class="topbar">
  <div>
    <div class="topbar-title">Page Title</div>
    <div class="topbar-subtitle">Subtitle or count</div>
  </div>
  <div class="topbar-actions">
    <!-- Search bars, filters, action buttons -->
  </div>
</div>

<!-- Content area -->
<div class="page-content">
  <!-- Presentational components render here -->
  <app-data-table [data]="filteredData()" (actionRequested)="onAction($event)" />
</div>

<!-- Modals sit outside page-content -->
<app-detail-modal [item]="selectedItem()" (closed)="onClose()" />
```

**Rules:**
- The **topbar** always lives at the page level — presentational components never render their own topbar
- Search, filters, and action buttons belong in `topbar-actions`
- Data tables are pure — they receive data via `input()` and emit events via `output()`
- Modals sit outside `page-content`

---

## 2. Reactivity: Signals vs. RxJS

### 2.1 Signals-First Approach

Angular 20 signals are the **default** for component and service state.

| Use Case | Tool |
|---|---|
| Local/UI state | `signal()`, `computed()`, `linkedSignal()` |
| Derived/calculated values | `computed()` |
| HTTP responses consumed in templates | `toSignal()` at the service boundary |
| Complex async streams (debounce, merge, retry, polling) | RxJS `Observable` |
| HTTP calls in services | RxJS `Observable` (Angular `HttpClient` returns them) |
| Bridging signal → observable | `toObservable()` |

### 2.2 Signal Patterns

```typescript
// Component state
protected readonly products = signal<ProductState[]>([]);
protected readonly isLoading = signal(false);
protected readonly selectedId = signal<string | null>(null);

// Derived state
protected readonly selectedProduct = computed(() =>
  this.products().find(p => p.id === this.selectedId())
);

// Service exposing signals
readonly products = toSignal(this.http.get<ProductResponse[]>('/api/products').pipe(
  map(res => res.map(mapProductResponseToState))
), { initialValue: [] });
```

### 2.3 When RxJS Is Still Appropriate

- Debounced search inputs
- WebSocket / SSE streams
- Complex orchestration (race, merge, switchMap chains)
- Retry/polling logic

In templates, prefer signal reads (`products()`) over `async` pipe where possible.

---

## 3. Service Rules

### 3.1 Single Responsibility

A service must handle only one feature domain. Examples:

- `DonationsService`
- `ContainerService`
- `DonorRewardsService`

### 3.2 Allowed Service Responsibilities

Services **may:**

- Perform API calls (or delegate to data sources like `MockDataService`)
- Call mappers for all transformations — no inline mapping logic
- Return State Models to components (as `Observable` or `Signal`)
- Handle caching/utility logic

Services **must NOT:**

- Touch UI
- Modify component state directly
- Contain presentation logic
- Contain inline mapping logic (use mapper functions instead)

### 3.3 HTTP Service Rules

- Always use `HttpClient` via `inject(HttpClient)`
- Always return State Models, not raw responses
- Always call mapper functions for transformations

```typescript
// Service delegates to mapper
getProducts(): ProductState[] {
  return this.mockData.products.map(mapProductResponseToState);
}

// Exposing as signal for template consumption
readonly products = toSignal(
  this.http.get<ProductResponse[]>('/api/products').pipe(
    map(res => res.map(mapProductResponseToState))
  ),
  { initialValue: [] }
);
```

### 3.4 Error Handling in Services

- Use a global `HttpInterceptor` for cross-cutting concerns (auth errors, network failures, logging)
- Feature-level errors should be caught and mapped to state in the service or component
- Never let raw `HttpErrorResponse` reach the template

### 3.5 Naming

```
donations.service.ts
container.service.ts
donor-rewards.service.ts
```

---

## 4. Model Rules

> State Model is the only model used in UI.

All model files live in a **flat `models/` directory** — no sub-folders. Each file uses the naming convention `feature-name.{type}.ts`.

| File | Purpose | When Required |
|---|---|---|
| `feature.state.ts` | UI Binding models | **Always** |
| `feature.request.ts` | API Request contracts | When feature has write operations |
| `feature.response.ts` | API Response contracts | **Always** (for future API readiness) |
| `feature.mapper.ts` | Pure mapping functions | **Always** (services call mappers, not inline logic) |
| `feature.enum.ts` | Feature-specific enums/constants | When applicable |

Mapping direction:

- `Response → State` (Mapper)
- `State → Request` (Mapper)

### 4.1 State Models (UI Models)

State = what the UI directly binds to.

**Rules:**

- Must match UI requirements
- Should never contain API-only fields
- Use a standard async state pattern for loading/error:

```typescript
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface ProductState {
  id: string;
  title: string;
  price: number;
}

export interface ProductPageState {
  products: ProductState[];
  status: AsyncStatus;
  error?: string;
}
```

### 4.2 Request Models

Strict API request format. Created for features with write operations.

```typescript
export interface ProductCreateRequest {
  title: string;
  price: number;
}
```

### 4.3 Response Models

Strict API response format. Always created for future API readiness.

```typescript
export interface ProductResponse {
  id: string;
  name: string;
  price: number;
}
```

### 4.4 State <-> API Mapping Rules

> No UI binds directly to API responses.

**Response → State:**

- Add missing UI fields
- Compute derived UI attributes (badge classes, labels)
- Rename backend fields to match UI semantics

**State → Request:**

- Strip UI-specific flags (`status`, `error`, computed fields)
- Convert field names to match API contract
- Validate shapes

### 4.5 Typing Rules

- **Strict** types only — `strict: true` in tsconfig
- No `any` — use `unknown` for truly dynamic data, then narrow with type guards
- Interfaces over classes for data shapes
- Enums use string values:

```typescript
// Feature-scoped enum
export enum ProductStatus {
  Active = 'Active',
  Inactive = 'Inactive',
}

// Badge class mappings as const records
export const StatusBadgeClass: Record<ProductStatus, string> = {
  [ProductStatus.Active]: 'badge-success',
  [ProductStatus.Inactive]: 'badge-gray',
};

// Type aliases for string literal unions
export type WizardStep = 'details' | 'template' | 'review';
```

### 4.6 Enum File Rules

- Feature-specific enums, type aliases, and const mappings go in `feature.enum.ts`
- Shared/cross-cutting enums stay in `core/models/domain.models.ts`
- Badge class mappings (`Record<EnumType, string>`) belong in the enum file, referenced by mappers

---

## 5. Mapper Rules

### 5.1 Location

Mappers live in the `models/` folder alongside state, request, response, and enum files:

```
models/
  feature.state.ts
  feature.request.ts
  feature.response.ts
  feature.mapper.ts        ← Mapper file
  feature.enum.ts
```

### 5.2 Pure Functions Only

Mappers must be:

- Stateless
- Side-effect free
- No service injection
- No external dependencies
- Easy to unit test
- **Always used by services** — services must never contain inline mapping logic

### 5.3 Mapping Examples

**Response → State:**

```typescript
export const mapProductResponseToState = (res: ProductResponse): ProductState => ({
  id: res.id,
  title: res.name, // field rename: backend "name" → UI "title"
  price: res.price,
});
```

**State → Request:**

```typescript
export const mapStateToProductRequest = (state: ProductState): ProductCreateRequest => ({
  title: state.title,
  price: state.price,
});
```

**Badge/label mapping using enum constants:**

```typescript
import { StatusBadgeClass } from './feature.enum';

export const mapItemToState = (item: ItemResponse): ItemState => ({
  id: item.id,
  statusLabel: StatusLabel[item.status],
  statusBadgeClass: StatusBadgeClass[item.status],
});
```

---

## 6. Folder Structure

**Module-Based Feature Structure:**

```
/src/app/
  /core/                              # Singleton services, interceptors, guards
    /interceptors/
    /guards/
    /models/
      async-status.type.ts            # Shared AsyncStatus type
      domain.models.ts                # Shared enums, interfaces, label maps
    /services/
  /shared/                            # Reusable presentational components, pipes, directives
    /components/
  /modules/
    /staff-portal/
      staff-portal.component.ts
      staff-portal.routes.ts
      /features/
        /donations/                   # Feature folder
          /pages/                     # Container (route-level) components
            donations-page.component.ts
            donations-page.component.html
            donations-page.component.scss
          /components/                # Presentational components
            /donation-table/
              donation-table.component.ts
              donation-table.component.html
              donation-table.component.scss
            /donation-detail-modal/
              ...
          /services/
            donations.service.ts
          /models/                    # FLAT — no sub-folders
            donations.state.ts
            donations.request.ts
            donations.response.ts
            donations.mapper.ts
            donations.enum.ts
    /donor-portal/
      donor-portal.component.ts
      donor-portal.routes.ts
      /features/
        /history/
          ...same pattern
```

**Key rules:**
- `modules/<portal>/features/<feature-name>/` is the feature root
- `models/` is **flat** — no `state/`, `request/`, `response/` sub-folders
- Mappers live in `models/`, not in a separate `mappers/` directory
- Each presentational component gets its own subfolder in `components/`
- Old monolithic component files must be deleted after rewrite

---

## 7. Routing & Lazy Loading

### 7.1 Route Structure

- Use `loadComponent` for lazy-loaded route components
- Use `loadChildren` for lazy-loaded feature route files
- Use functional guards (`canActivate: [() => inject(AuthService).isAuthenticated()]`)
- Use functional resolvers where pre-fetching is needed
- Routes point to `pages/` directory

```typescript
export const staffRoutes: Routes = [
  {
    path: 'donations',
    data: { breadcrumb: 'Donations' },
    loadComponent: () =>
      import('./features/donations/pages/donations-page.component')
        .then(m => m.DonationsPageComponent),
  },
  {
    path: 'donors',
    data: { breadcrumb: 'Donors' },
    loadComponent: () =>
      import('./features/donors/pages/donors-page.component')
        .then(m => m.DonorsPageComponent),
  },
];
```

### 7.2 Guard Conventions

- Prefer functional guards over class-based guards
- Auth guards redirect to the external login URL (this app uses shared JWT cookies)
- Guards return `boolean | UrlTree`, never `Observable<boolean>` unless async checks are required

---

## 8. Testing Strategy

### 8.1 What to Test

| Layer | Test Type | Priority |
|---|---|---|
| Mappers | Unit tests (pure functions) | **Required** — highest ROI |
| Services | Unit tests with `provideHttpClientTesting()` | **Required** |
| Container components | Integration tests (service interaction, routing) | Required |
| Presentational components | Unit tests (input/output contracts) | Recommended |
| Guards & Interceptors | Unit tests | Required |

### 8.2 Testing Patterns

```typescript
// Mapper test — pure function, no setup needed
describe('mapProductResponseToState', () => {
  it('should map name to title', () => {
    const response: ProductResponse = { id: '1', name: 'Widget', price: 9.99 };
    const state = mapProductResponseToState(response);
    expect(state.title).toBe('Widget');
  });
});

// Service test
describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });
});
```

---

## 9. Import Conventions

- Use path aliases defined in `tsconfig.json`:
  - `@app/*` → `src/app/*`
  - `@core/*` → `src/app/core/*`
  - `@shared/*` → `src/app/shared/*`
  - `@staff/*` → `src/app/modules/staff-portal/features/*`
  - `@donor/*` → `src/app/modules/donor-portal/features/*`
- No deep relative paths (`../../../`)
- Group imports: Angular → third-party → app aliases → relative

```typescript
// Angular
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

// Third-party
import { map } from 'rxjs';

// App aliases
import { ToastService } from '@core/services/toast.service';
import { IconComponent } from '@shared/components/icon/icon.component';

// Relative (within feature)
import { DonationsService } from '../services/donations.service';
import { DonationListItemState } from '../models/donations.state';
import { mapDonationToListItem } from '../models/donations.mapper';
```

---

## 10. Coding Agent Execution Behavior

When the agent receives a UI or feature description:

### 10.1 Must Output

- Component breakdown (container vs. presentational)
- Folder structure following Section 6
- Services needed
- State models (with `AsyncStatus` pattern for async data)
- Request/Response models
- Mappers (always — services must not inline mapping)
- Enums (where applicable)
- Signal vs. RxJS decisions with justification
- API → state flow
- UI → request flow

### 10.2 Code Generation Must Follow

- UI only binds to state models (via signals or `async` pipe)
- Services return state models, calling mapper functions for all transformations
- Every component has 3 separate files (`.ts`, `.html`, `.scss`)
- Use `templateUrl` / `styleUrl` — never inline `template` / `styles`
- Use `input()` / `output()` / `model()` — never `@Input()` / `@Output()`
- Use `inject()` — never constructor injection
- Use `OnPush` change detection on every component
- Page components own the topbar — presentational components never render their own

### 10.3 Hard Restrictions

Agents must **NOT:**

- Bind UI directly to API responses
- Put inline mapping logic in services (use mapper functions)
- Put business logic inside components
- Make presentational components fetch data
- Use `any` type (use `unknown` + type guards instead)
- Use decorator-based `@Input()` / `@Output()` / `@Injectable` constructor injection
- Use inline `template` or `styles` in component decorators
- Create sub-folders inside `models/`
- Create a separate `mappers/` directory (mappers live in `models/`)
- Ignore error handling — every HTTP call must have an error path
- Embed topbar/search/filters inside presentational table components

### 10.4 Cleanup After Rewrite

When rewriting an existing feature:

- Delete old monolithic component files
- Delete old `*.models.ts` files (replaced by typed `.state.ts`, `.mapper.ts`, etc.)
- Update route files to point to new `pages/` component
- Verify build compiles with `npm run build -- --configuration=development`
