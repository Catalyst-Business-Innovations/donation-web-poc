# Navbar & User Profile — Implementation Reference

> **Purpose:** Coding-agent reference for the top navbar and user profile dropdown in the CompanyMgmt Angular application.

---

## Files Involved

| File | Role |
|---|---|
| `src/app/shared/components/navmenu/navmenu.component.ts` | Component logic |
| `src/app/shared/components/navmenu/navmenu.component.html` | Template |
| `src/app/shared/components/navmenu/navmenu.component.css` | Styles |
| `src/app/features/services/custom-breadcrumb.service.ts` | Page title (left side) |
| `src/app/core/services/master.service.ts` | Reads user from `localStorage` |
| `src/app/features/company-portal/modules/user-management/services/user-management.service.ts` | Fetches full user profile via API |
| `src/app/shared/services/shared.service.ts` | Logout API + session cleanup |

---

## 1. Placement in Layout

`<app-navmenu>` is rendered inside `.nav-bar` in `LayoutComponent`:

```html
<!-- layout.component.html -->
<div class="nav-bar d-none d-lg-block">   <!-- height: 100px, hidden on mobile -->
  <app-navmenu></app-navmenu>
</div>
```

The navbar is **desktop-only** — no mobile/responsive version exists.

---

## 2. Template Structure

```
.nav-wrapper  (flex row, space-between, height: 100%, border: 1px solid #eeeeee, padding-inline: 36px)
│
├── <h4 class="mb-0">{{ activeCrumb }}</h4>          ← Page title (left)
│
└── .dropdown                                         ← Bootstrap dropdown (right)
      └── .user-profile  [data-bs-toggle="dropdown"]
            ├── Profile image  (avatar or custom photo)
            ├── .user-name
            │     ├── .name  (display name or first + last)
            │     └── Role subtitle  (+N tooltip for multiple roles)
            ├── Dropdown arrow icon  (rotates 180° when open)
            └── .dropdown-menu
                  ├── Company name  → /company-portal/settings/company-settings
                  ├── My Profile   → /user-profile
                  └── Logout
```

---

## 3. Component Class — `NavmenuComponent`

```typescript
selector: 'app-navmenu'
standalone: false
```

### State properties

| Property | Type | Description |
|---|---|---|
| `userDetails` | `any` | Raw JWT-decoded user object from `localStorage` (has `userid`, `role`, `companyid`) |
| `userObj` | `UserModel` | Full user profile fetched from API (has `displayName`, `firstName`, `lastName`, `profileFileUrl`, `company`) |
| `activeCrumb` | `string` | Current page title from `CustomBreadcrumbService` |
| `dropdownOpen` | `boolean` | Tracks dropdown open/close for arrow rotation |

### `ngOnInit()`

```typescript
ngOnInit(): void {
  // 1. Read raw user data from localStorage
  this.userDetails = this.masterService.getUserDetailFromStorage();

  // 2. Fetch full profile from API (cached)
  this.getUserDetails();

  // 3. Subscribe to page title changes
  this.breadcrumbService.activeCrumbName$.subscribe((crumb) => {
    this.activeCrumb = crumb;
  });
}
```

### `getUserDetails(isUpdate = false)`

Calls `UsersManagementService.getUserLiteById(userId, isUpdate)` which hits:
```
GET /api/Users/{id}/Lite
```
Response is **cached with `shareReplay(1)`** — subsequent calls within the same session return the cached observable unless `isUpdate = true` is passed (used after profile edits).

---

## 4. Left Side — Page Title (Breadcrumb)

Powered by **`CustomBreadcrumbService`** (`src/app/features/services/custom-breadcrumb.service.ts`).

### How it works

```typescript
// Service listens to every NavigationEnd event
this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
  let crumb = this.getRouteData(this.route.root);  // walks ActivatedRoute tree
  crumb = this.applyRoleBasedOverride(crumb);       // adjusts label by role
  if (crumb) this._activeCrumb.next(crumb);
});
```

**`getRouteData()`** — recursively walks `ActivatedRoute.firstChild` and reads `route.snapshot.data['breadcrumb']`. The deepest child route with a `breadcrumb` value wins.

**Setting a breadcrumb on a route:**
```typescript
{ path: 'company-listing', component: CompanyListingComponent, data: { breadcrumb: 'Company Management' } }
```

### Role-based overrides

Some routes are shared between Admin and Company portals, so the label is adjusted:

| `data['breadcrumb']` value | Admin (`companyId == -1`) | Company user |
|---|---|---|
| `'Department'` | `'Data Management'` | `'Product Management'` |
| `'Store Group'` | `'Data Management'` | `'Store Management'` |
| `'Attribute'` | `'Data Management'` | `'Product Management'` |

The admin is identified by `user.companyid == ROOT_COMPANY_ID` (constant = `-1`).

### Public API

```typescript
get activeCrumbName$(): Observable<string>  // subscribe for live updates
getCurrentBreadcrumb(): string              // get current value synchronously
```

---

## 5. Right Side — User Profile

### Profile Image

```html
<!-- Default avatar (when no custom photo) -->
<img width="65" *ngIf="!userObj.profileFileUrl"
     src="assets/images/company-management/ic_userSample.svg" />

<!-- Custom photo -->
<div class="profile-pic" *ngIf="userObj.profileFileUrl">
  <img [src]="userObj.profileFileUrl" />
</div>
```

| Property | Value |
|---|---|
| Default avatar size | `width: 65px` (SVG) |
| Custom photo container | `48×48px`, `border-radius: 50%` |
| Custom photo fit | `object-fit: cover; border-radius: 50%` |

### Display Name

```html
{{ userObj.displayName?.trim() ? userObj.displayName : userObj.firstName + ' ' + userObj.lastName }}
```

Priority: `displayName` (if set and non-empty) → `firstName + ' ' + lastName`

### Role Display

```typescript
get isRoleArray(): boolean {
  return Array.isArray(this.userDetails?.role) && this.userDetails.role.length > 1;
}
```

| Case | Display |
|---|---|
| Single role | Role string directly |
| Multiple roles | `role[0]` + `+N` counter badge |

Hovering the `+N` badge reveals `.show-list` — a dark floating list (`rgba(0,0,0,0.7)`, `border-radius: 6px`) showing remaining roles. Positioned `top: 70px; left: 40px; width: 240px`.

### Dropdown Arrow

```html
<img src="assets/images/icon-park_down.svg"
     [ngStyle]="{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }" />
```

`dropdownOpen` is set via Bootstrap's native dropdown events:
```html
(shown.bs.dropdown)="dropdownOpen = true"
(hidden.bs.dropdown)="dropdownOpen = false"
```

### Dropdown Menu Items

| Item | Action |
|---|---|
| `userObj.company?.name` | `router.navigate(['/company-portal/settings/company-settings'])` |
| My Profile | `router.navigate(['/user-profile'])` |
| Logout | `logout()` |

---

## 6. Logout Flow

```typescript
logout() {
  const sessionId = sessionStorage.getItem('sessionId');
  const userDetails = localStorage.getItem('user');

  // 1. Reset permission cache
  this.masterService.userPermissions = [];
  this.masterService.rolesLoaded = false;

  // 2. Build signout payload
  let signOut = new Signout();
  signOut.sessionId = sessionId;
  signOut.userId = JSON.parse(userDetails).userid;

  // 3. Set logout cookie (signals other tabs/apps to log out)
  this.cookieService.set('logoutEvent', '1', 1/144, '/', domain);

  // 4. Notify Datadog RUM if enabled
  this.sharedService.getDatadogConfig(ROOT_COMPANY_ID, false).subscribe(res => {
    if (res.enableRumForCompanyApp) onUserLogout();  // from main.ts
  });

  // 5. Call sign-out API: POST /api/Auth/SignOut
  this.sharedService.logout(signOut).subscribe({
    next: () => this.completeCleanup(),
    error: () => this.completeCleanup(),  // cleanup regardless of API result
  });
}

private completeCleanup() {
  this.sharedService.performFullSessionCleanup();  // clears localStorage, sessionStorage, all cookies
  this.router.navigate(['/shared/login']);
}
```

**`performFullSessionCleanup()`** clears:
- `localStorage.clear()`
- `sessionStorage.clear()`
- All cookies on `/`, `/.domain`, `/domain`, `/shared` paths via `CookieService`

---

## 7. `UserModel` — Key Fields Used in Navbar

From `src/app/features/company-portal/modules/user-management/models/user-management.models.ts`:

```typescript
class UserModel {
  id: number
  firstName: string
  lastName: string
  displayName: string          // shown in navbar header (priority over first+last)
  profileFileUrl: string       // custom avatar URL (empty string = use default SVG)
  company: CompanyModel        // company.name shown as first dropdown item
  userRoles: RoleModel[]
  email: string
  jobTitle: string
  // ... many more fields used elsewhere
}
```

---

## 8. MasterService — `getUserDetailFromStorage()`

```typescript
getUserDetailFromStorage() {
  return JSON.parse(localStorage.getItem('user')!);
}
```

Returns the JWT-decoded user object stored under the `'user'` key in `localStorage` at login time. Fields used by navbar: `userid`, `role` (string or string[]), `companyid`.

---

## 9. CSS Summary

### `.nav-wrapper`
```css
display: flex;
justify-content: space-between;
align-items: center;
width: 100%;
height: 100%;
border: 1px solid #eeeeee;
padding-inline: 36px;
```

### Dropdown menu
```css
z-index: 41020;
border: none;
box-shadow: 0px 2px 3px #cbcbcb;
/* aligned to right edge */
right: 0; left: unset;
```

### Profile name / role
```css
.name      { font-size: 1.1rem; margin-bottom: -3px; }
.secondary { font-size: 14px; color: #999999; padding-top: 6px; }
```

### Dropdown item hover
```css
background-color: #f4f4f4;
color: #757575;
border-radius: 4px;
```

---

## 10. Dependency Injection Summary

```typescript
constructor(
  private router: Router,
  private sharedService: SharedService,           // logout(), getDatadogConfig()
  private breadcrumbService: CustomBreadcrumbService,  // page title
  private masterService: MasterService,           // getUserDetailFromStorage()
  private cookieService: CookieService,           // logoutEvent cookie
  private userManagementService: UsersManagementService,  // getUserLiteById()
)
```
