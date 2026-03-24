# Angular Coding Agent SOP

**For Components, Services, State Models, Requests, Responses & Mappers**

- **Version:** 2.0
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

- Fetch data using services
- Manage state via signals
- Trigger side effects
- Handle page-level events
- Orchestrate child presentational components

**Presentational Components**

- Receive data via `input()` signals
- Emit events via `output()`
- Render UI only
- No data-fetching service injection (utility services like `Router`, `DestroyRef` are allowed)
- No business logic

### 1.3 Component Standards

- Use standalone components (default in Angular 20)
- Use `OnPush` change detection
- Use `inject()` function for dependency injection (not constructor injection)
- Use strict typing
- If a component handles more than one user-facing concern, split it. Use ~250 lines as a smell indicator, not a hard rule.

```typescript
// Preferred DI pattern
private readonly productService = inject(ProductService);
private readonly router = inject(Router);
private readonly destroyRef = inject(DestroyRef);

// Avoid: constructor injection
// constructor(private productService: ProductService) {}
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

- `ProductService`
- `OrderService`

### 3.2 Allowed Service Responsibilities

Services **may:**

- Perform API calls
- Call mappers
- Return State Models to components (as `Observable` or `Signal`)
- Handle caching/utility logic

Services **must NOT:**

- Touch UI
- Modify component state directly
- Contain presentation logic

### 3.3 HTTP Service Rules

- Always use `HttpClient` via `inject(HttpClient)`
- Always return State Models, not raw responses
- Always map API response → state model (inline or via mapper)

```typescript
// Simple case — inline mapping is fine
getProduct(id: string): Observable<ProductState> {
  return this.http.get<ProductResponse>(`/api/products/${id}`).pipe(
    map(mapProductResponseToState)
  );
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

```typescript
getProduct(id: string): Observable<ProductState> {
  return this.http.get<ProductResponse>(`/api/products/${id}`).pipe(
    map(mapProductResponseToState),
    catchError(err => {
      // Log, transform, or rethrow as a domain-specific error
      return of({ ...emptyProductState, status: 'error', error: extractErrorMessage(err) });
    })
  );
}
```

### 3.5 Naming

```
product.service.ts
user.service.ts
```

---

## 4. Model Rules

> State Model is the only model used in UI.

We use three model types:

| Model Type | Purpose |
|---|---|
| State Models | UI Binding |
| Request Models | API Request |
| Response Models | API Response |

Mapping direction:

- `Response → State` (Mapper)
- `State → Request` (Mapper)

If the API response shape closely matches the UI needs, a shared interface is acceptable — do not create a mapper that is just an identity function. Mappers are required when shapes genuinely diverge.

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

Strict API request format.

```typescript
export interface ProductCreateRequest {
  title: string;
  price: number;
}
```

### 4.3 Response Models

Strict API response format.

```typescript
export interface ProductResponse {
  id: string;
  name: string;
  price: number;
}
```

### 4.4 State <-> API Mapping Rules

> No UI binds directly to API responses (unless shapes are identical — see section 4 intro).

**Response → State:**

- Add missing UI fields
- Compute derived UI attributes
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
```

---

## 5. Mapper Rules

### 5.1 When Mappers Are Required

Mappers are required when the API response shape **differs** from the UI state shape (field renaming, derived fields, structural differences). If shapes are identical, inline mapping or direct assignment in the service is acceptable.

When required, each feature should have:

```
mappers/
  product-state.mapper.ts      // Response → State
  product-request.mapper.ts    // State → Request
```

### 5.2 Pure Functions Only

Mappers must be:

- Stateless
- Side-effect free
- No service injection
- No external dependencies
- Easy to unit test

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

---

## 6. Folder Structure

**Root Feature-Based Structure:**

```
/src/app/
  /core/                        # Singleton services, interceptors, guards
    /interceptors/
    /guards/
    /models/                    # Shared/cross-cutting models
  /shared/                      # Reusable presentational components, pipes, directives
  /features/
    /products/
      /components/              # Presentational components
      /pages/                   # Container/route-level components
      /services/
      /models/
        /state/
        /request/
        /response/
        /enums/
      /mappers/                 # Only if shapes diverge (see section 5.1)
```

---

## 7. Routing & Lazy Loading

### 7.1 Route Structure

- Use `loadComponent` for lazy-loaded route components
- Use `loadChildren` for lazy-loaded feature route files
- Use functional guards (`canActivate: [() => inject(AuthService).isAuthenticated()]`)
- Use functional resolvers where pre-fetching is needed

```typescript
export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/product-list/product-list.component')
      .then(m => m.ProductListComponent),
    resolve: { products: () => inject(ProductService).getProducts() },
  },
  {
    path: ':id',
    loadComponent: () => import('./pages/product-detail/product-detail.component')
      .then(m => m.ProductDetailComponent),
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

- Use path aliases defined in `tsconfig.json` (e.g., `@app/`, `@core/`, `@features/`, `@shared/`)
- No deep relative paths (`../../../`)
- Group imports: Angular → third-party → app aliases → relative

```typescript
// Angular
import { Component, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// Third-party
import { map } from 'rxjs';

// App aliases
import { ProductState } from '@features/products/models/state/product.state';
import { ProductService } from '@features/products/services/product.service';
```

---

## 10. Coding Agent Execution Behavior

When the agent receives a UI or feature description:

### 10.1 Must Output

- Component breakdown (container vs. presentational)
- Folder structure
- Services needed
- State models (with `AsyncStatus` pattern for async data)
- Request/Response models
- Mappers (only if shapes diverge)
- Signal vs. RxJS decisions with justification
- API → state flow
- UI → request flow

### 10.2 Code Generation Must Follow

- UI only binds to state models (via signals or `async` pipe)
- Services return state models
- Transformations via mappers when shapes diverge; inline when trivial
- Use `input()` / `output()` / `model()` — never `@Input()` / `@Output()`
- Use `inject()` — never constructor injection
- Use `OnPush` change detection

### 10.3 Hard Restrictions

Agents must **NOT:**

- Bind UI directly to API responses
- Skip mappers when API and UI shapes genuinely differ
- Put business logic inside components
- Make presentational components fetch data
- Use `any` type (use `unknown` + type guards instead)
- Use decorator-based `@Input()` / `@Output()` / `@Injectable` constructor injection
- Ignore error handling — every HTTP call must have an error path
