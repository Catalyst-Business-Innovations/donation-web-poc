# Layout Design Reference

> **Purpose:** Coding-agent reference document describing the full UI layout system, brand colors, typography, and component structure for the CompanyMgmt Angular application.

---

## Table of Contents
1. [Overall Shell Structure](#1-overall-shell-structure)
2. [Sidebar (Icon Navigation)](#2-sidebar-icon-navigation)
3. [Top Navbar](#3-top-navbar)
4. [Submenu Panel (Secondary Sidebar)](#4-submenu-panel-secondary-sidebar)
5. [Main Content Area](#5-main-content-area)
6. [Brand Colors & Color Palette](#6-brand-colors--color-palette)
7. [Typography](#7-typography)
8. [Global Utility Classes & Buttons](#8-global-utility-classes--buttons)
9. [Tables & Listing Pages](#9-tables--listing-pages)
10. [Modals & Off-canvas Panels](#10-modals--off-canvas-panels)
11. [Toast Notifications](#11-toast-notifications)
12. [Login Page](#12-login-page)
13. [Landing Page](#13-landing-page)
14. [Portal Contexts](#14-portal-contexts)
15. [Permissions System](#15-permissions-system)
16. [Angular Material Theme](#16-angular-material-theme)
17. [Key Asset Paths](#17-key-asset-paths)
18. [Responsive Behavior](#18-responsive-behavior)

---

## 1. Overall Shell Structure

The authenticated app shell is implemented in `LayoutComponent` (`src/app/shared/components/layout/`).

### Structure (flex row, full viewport height)

```
┌──────────────────────────────────────────────────────────────────┐
│  .container-fluid  (height: 100vh)                               │
│  .d-flex .h-100                                                  │
│                                                                  │
│  ┌─────────┐  ┌───────────────────────────────────────────────┐  │
│  │         │  │  .nav-bar  (height: 100px)                    │  │
│  │         │  │  <app-navmenu>                                │  │
│  │ sidebar │  ├───────────────────────────────────────────────┤  │
│  │ (icon   │  │  .brij-content  (height: calc(100% - 100px)) │  │
│  │  rail)  │  │                                              │  │
│  │         │  │  ┌──────────────┐  ┌────────────────────┐   │  │
│  │         │  │  │  .submenus   │  │  <router-outlet>   │   │  │
│  │         │  │  │  (20rem, opt)│  │  (flex-basis: 85%) │   │  │
│  │         │  │  └──────────────┘  └────────────────────┘   │  │
│  └─────────┘  └───────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

- The sidebar is **hidden on mobile/tablet** (`d-none d-lg-block`).
- The submenu panel is **conditionally rendered** (`*ngIf="isExpandSubMenu"`).
- The `router-outlet` width adapts: `100%` with no submenu, `85%` when submenu is open.

---

## 2. Sidebar (Icon Navigation)

**Component:** `LayoutComponent` (inline — the sidebar is part of the layout template, not a separate component)

### Visual Design
| Property | Value |
|---|---|
| Width | Auto (icon size ~54px with padding) |
| Height | 100vh |
| Background | White |
| Right border | `1px solid #eeeeee` |
| Padding inline | `10px` |

### Header / Logo Area
| Property | Value |
|---|---|
| Height | `122px` |
| Content | Centered logo image |
| Logo file | `assets/images/onboarding/newbrijjlogo.svg` |
| Logo size | `height: 5rem; width: 6rem` |

### Navigation Items (`.tool-wrap`)
Each menu item is a `<li class="tool-wrap">` containing an `<a>` link with an icon inside.

| State | Style |
|---|---|
| Default | `padding: 10px 12px; border-radius: 10px;` on `<a>` |
| Active (`.active`) | `box-shadow: 0px 0px 15px -3px rgb(140, 140, 140)` — soft grey glow |
| List item padding | `padding: 16px 10px` |

> Icons are SVG images (~24×24px). One exception uses a Font Awesome icon class (`fa-solid fa-warehouse`) for Inventory Management.

### Tooltips (`.tool-tip`)
Tooltips appear to the right of each icon on hover.

| Property | Value |
|---|---|
| Background | `rgba(0, 0, 0, 0.7)` |
| Text color | White |
| Font size | `13px` |
| Border radius | `6px` |
| Padding | `8px 10px` |
| Position | `absolute; left: 74px; bottom: 21px` |
| Visible on | `.tool-wrap:hover` |
| Arrow | Rotated pseudo-element square, same dark bg, pointing left |

### Sidebar Menu Items

The sidebar is split into two `<ul>` groups rendered via `flex-direction: column; justify-content: space-between` — **main nav items** at top, **Settings** at bottom.

#### Admin Portal Sidebar Items (`companyId === -1`)
| Icon | Label | Route | Permission |
|---|---|---|---|
| `duo-icons_dashboard.svg` | Dashboard | `/admin-portal/admin-dashboard` | — |
| `duo-icons_building.svg` | Company Management | `/admin-portal/company-management/company-listing` | `Company:View` |
| `duo-icons_user.svg` | User Management | `/admin-portal/user-management/users-listing` | `Role:View` or `User:View` |
| `ic_productManagment.svg` | Data Management | `/admin-portal/brands` | `Brand:View`, `ProductAttribute:View`, etc. |
| `ic_productManagment.svg` | Billing System | `/admin-portal/billing-system/billable-services` | `SubscriptionPlan:View` |
| `recall.png` | Callback Requests | `/admin-portal/callback-requests` | `CallbackRequest:View` |
| `upload-sign.svg` | Upload Latest Builds | `/admin-portal/upload-latest-build` | — |
| `duo-icons_settings.svg` | Settings | `/admin-portal/settings/datadog-settings` | — |

#### Company Portal Sidebar Items (`companyId > 0`)
| Icon | Label | Route | Permission |
|---|---|---|---|
| `duo-icons_dashboard.svg` | Dashboard | `/home` | — |
| `duo-icons_user.svg` | User Management | `/company-portal/user-management/user` | `Role:View` or `User:View` |
| `ic_productManagment.svg` | Product Management | `/company-portal/brands` *(default)* | Permission-filtered submenus |
| `company-management/store_management.svg` | Store Management | `/company-portal/stores` *(default)* | Permission-filtered submenus |
| `ic_warehouse.svg` | Warehouse Management | `/company-portal/warehouses` *(hidden by default)* | Permission-filtered submenus |
| `fa-solid fa-warehouse` | Inventory Management | External IMS URL | — |
| `duo-icons_settings.svg` | Settings | `/company-portal/settings/company-settings` | — |

---

## 3. Top Navbar

**Component:** `NavmenuComponent` (`src/app/shared/components/navmenu/`)

### Layout
```
┌────────────────────────────────────────────────────────────────────┐
│  .nav-wrapper  (height: 100px, border: 1px solid #eeeeee)          │
│  padding-inline: 36px                                              │
│                                                                    │
│  ← [Page Title / Breadcrumb <h4>]    [User Profile Dropdown] →    │
└────────────────────────────────────────────────────────────────────┘
```

### Left side — Page title
- `<h4 class="mb-0">{{ activeCrumb }}</h4>` — current breadcrumb/page name
- Provided by `CustomBreadcrumbService`

### Right side — User Profile Dropdown
The dropdown trigger is `.user-profile` (Bootstrap dropdown).

**Profile section structure:**
```
[Profile Image]  [Display Name  ]  [▼]
                 [Role subtitle  ]
```

| Element | Style |
|---|---|
| Profile image (default) | `width: 65px` — `assets/images/company-management/ic_userSample.svg` |
| Profile image (custom) | `.profile-pic` — `48×48px`, `border-radius: 50%`, `object-fit: cover` |
| Display name | `font-size: 1.1rem; margin-bottom: -3px` |
| Role subtitle | `font-size: 14px; color: #999999; padding-top: 6px` |
| Down arrow icon | `assets/images/icon-park_down.svg`, rotates `180deg` when open |
| Padding between avatar and text | `padding-left: 10px` |

**Dropdown Menu:**

```
[ Company Name ]
[ My Profile   ]
[ Logout       ]
```

| Property | Value |
|---|---|
| Border | None |
| Box shadow | `0px 2px 3px #cbcbcb` |
| z-index | `41020` |
| Item list padding | `4px 10px` |
| Link color | `#757575` |
| Link hover bg | `#f4f4f4` |
| Alignment | Aligned to the right edge of the trigger |

---

## 4. Submenu Panel (Secondary Sidebar)

The submenu panel is a **secondary sidebar** shown when the user clicks a sidebar menu item that has child routes (Product Management, Store Management, etc.).

### Visual Design

| Property | Value |
|---|---|
| Width | `20rem` (fixed when open) |
| Height | Full content area height |
| Right border | `1px solid #eeeeee` |
| Padding | `1rem` |
| Toggle condition | `isExpandSubMenu === true` |
| Dismiss | Click outside sidebar + submenu area |

### Submenu Header (`.submenuhead`)
| Property | Value |
|---|---|
| Font size | `0.875rem` |
| Color | `#141414` |
| Font weight | `700` |

### Divider (`.divider`)
| Property | Value |
|---|---|
| Height | `2px` |
| Background | `#181818` (near black) |
| Margin bottom | `1rem` |
| Border radius | `10px` |

### Submenu List Items (`.submenuList li`)
| State | Style |
|---|---|
| Default | `padding: 0.6rem 1rem; margin-bottom: 0.6rem; font-weight: 500; cursor: pointer` |
| Active (`.subActive`) / Hover | `background: #181818; color: white; border-radius: 15px; box-shadow: rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.3) 0px 3px 7px -3px` |

### Available Submenus

**Product Management** (Company Portal)
- Brands, Attributes, Category Types, Categories, Departments, Units, Tags, Label Formats, Suppliers

**Warehouse Management** (Company Portal — hidden by default)
- Warehouses, Zones, Location Types, Location Formats, Location Profiles, Locations

**Store Management** (Company Portal)
- Stores, Store Groups, Goal Groups

**Data Management** (Admin Portal)
- Brands, Product Categories, Product Departments, Store Types, Store Groups, Product Attributes

**Billing System** (Admin Portal)
- Billable Services, Subscription Plans, Company Discounts, Invoices

> All submenu items are controlled by `ngx-permissions` (`[ngxPermissionsOnly]`). Items not in the user's permission set are hidden.

---

## 5. Main Content Area

| Property | Value |
|---|---|
| Height | `calc(100% - 100px)` (subtracts navbar) |
| Overflow | `auto; scrollbar-width: thin` |
| Content padding | `1rem 2rem` (via `.content` class on individual pages) |

**Content container (listing/detail pages):**
- Wrapped in `.company-container`: `margin: 1% 2%; border: 1px solid #c8c8c8; border-radius: 24px; height: calc(100vh - 200px)`
- Top toolbar (`.top-part`): `height: 75px; justify-content: space-between; padding: 0px 15px`

---

## 6. Brand Colors & Color Palette

### Primary Brand Colors

| Name | Hex / RGBA | Usage |
|---|---|---|
| **Brand Blue** | `#0070b9` | Primary buttons, links, login button, "Add New" buttons, spinner accent |
| **Brand Blue Hover** | `#1e86db` | Hover state on primary buttons |
| **Brand Blue Dark** | `#1b6ec2` | Bootstrap `.btn-primary` override |
| **Brand Blue Deep** | `rgba(23, 95, 145, 1)` = `#175f91` | Off-canvas footer border, canvas button color |
| **Brand Lime / Accent** | `#a6df0c` / `rgba(166, 227, 1, 1)` | Create buttons, modal action buttons, search focus ring, toggle checkboxes, active selection highlight |

### Secondary / Status Colors

| Name | Hex | Usage |
|---|---|---|
| **Success Green** | `#269c41` → `#32a74b` (hover) | Confirm/save action buttons |
| **Success Green Light** | `rgba(58, 194, 121, 1)` | Toast success accent bar |
| **Success Green BG** | `rgba(197, 247, 220, 1)` | Toast success body background |
| **Error Red** | `#f33b3b` → `#e94848` | Cancel/delete buttons |
| **Error Red Toast** | `rgba(233, 89, 76, 1)` | Toast error accent bar |
| **Error Red BG** | `rgba(255, 207, 203, 1)` | Toast error body background |
| **Error 500** | `#f04438` | Login form error message text |
| **Error 50 BG** | `#fef3f2` | Login form error container bg |
| **Error 200 Border** | `#ffcdc9` | Login form error container border |
| **Disabled** | `rgba(204, 204, 204, 1)` = `#cccccc` | Disabled button |
| **Status Active Pill** | `rgb(0 177 7)` text, `rgba(232, 245, 233, 1)` bg | Active/enabled status badges |

### Neutral / UI Colors

| Name | Hex | Usage |
|---|---|---|
| **Border Light** | `#eeeeee` | Sidebar border, navbar border, dropdown wrappers |
| **Border Medium** | `#c8c8c8` | Content container border, table bottom border |
| **Divider** | `#f2f2f2` | Table thead shadow/divider |
| **Table Row Border** | `#f4f4f6` | Tbody row bottom border |
| **Table Header BG** | `rgba(250, 252, 255, 1)` | Thead background |
| **Table Header BG Alt** | `#f7f7f7` | Listing page `th` background |
| **Highlighted Row** | `#edffbb` | Special `.highlighted-row` table row |
| **Near Black (submenu active)** | `#181818` | Submenu active/hover, divider |
| **Text Primary** | `#000000` / `#141414` | Body text, form inputs |
| **Text Secondary** | `#999999` | Table headers, navbar role subtitle, inactive labels |
| **Text Mid-grey** | `#757575` | Dropdown menu links |
| **Text Dark-grey** | `#676767` | Login form subtitle |
| **Tooltip BG** | `rgba(0, 0, 0, 0.7)` | Sidebar tooltip, role list tooltip |
| **White** | `#ffffff` | Page backgrounds, cards, overlays |
| **Page BG (landing)** | `rgba(248, 250, 252, 1)` = `#f8fafc` | Landing page platforms strip, testimonial section |

### Summary — Core Color Tokens

```
--brand-blue:           #0070b9
--brand-blue-hover:     #1e86db
--brand-blue-deep:      #175f91
--brand-lime:           #a6df0c
--success:              #269c41
--error:                #f33b3b
--near-black:           #181818
--border-light:         #eeeeee
--border-medium:        #c8c8c8
--text-primary:         #000000
--text-secondary:       #999999
--bg-white:             #ffffff
--bg-page:              #f8fafc
```

---

## 7. Typography

### Font Families

| Font | Import Source | Usage |
|---|---|---|
| **Roboto** | Google Fonts | Primary body font (default `*` and `body`) |
| **Plus Jakarta Sans** | Google Fonts | Applied via `.jakarta-font` class |
| **Urbanist** | Google Fonts | Imported, available for use |
| **Poppins** | Used in select/option elements and `.fontstyle` class |

**Global rule:** `* { font-family: 'roboto'; }`  
**Body:** `font-family: Roboto, 'Helvetica Neue', sans-serif;`

### Font Sizes (common patterns)

| Element | Size | Weight |
|---|---|---|
| Page title (navbar `<h4>`) | Browser default h4 | Normal |
| Login heading | `34px` | `600` |
| Login subtitle | `18px` | `400` |
| Form label | `14px` | `600` |
| Button text | `15px–16px` | `500–700` |
| Table body | `14px` | `400` |
| Table head | Inherits | Normal |
| Secondary / role text | `14px` | `400` |
| Submenu heading | `0.875rem` (14px) | `700` |
| Submenu item | Body default | `500` |
| Tooltip | `13px` | Normal |
| Landing section title | `3.75rem` (60px) | `800` |
| Landing page text | `20px` | `400` |

---

## 8. Global Utility Classes & Buttons

### Button Styles

#### Primary Button (`.pri-btn`)
```css
background: #0070b9;
color: white;
border-radius: 10px;
padding: 0.5rem 1rem;   /* global styles.css */
/* OR */
padding: 6px 12px; font-size: 15px; height implied  /* commonStyles.css */
```
Hover: `background: #1e86db`

#### Add / Create Button (`.add-new-btn`, `.create-btn`)
```css
/* .create-btn — outline lime green */
background-color: #ffffff;
color: #a6df0c;
border: 1px solid #a6df0c;
border-radius: 9px;
height: 33px;
width: 125px;

/* .add-new-btn — filled lime green */
background-color: #a6df0c !important;
color: white !important;

/* .add-new-btn (listing page) — filled blue */
background-color: #0070b9;
color: white;
border-radius: 10px;
height: 45px;
```

#### Modal Action Button (`.modal-btn`)
```css
color: rgba(166, 227, 1, 1);   /* lime green text */
border: 1px solid #a6df0c;
border-radius: 9px;
width: 120px;
height: 35px;
```

#### Cancel Button (`.cancel-btn`)
```css
background: #f33b3b;
color: white;
border-radius: 10px;
```

#### Confirm Button (`.confirm-btn`)
```css
background: #269c41;
color: white;
border-radius: 10px;
transition: background-color 0.2s ease, transform 0.1s ease;
```
Hover: `#32a74b` | Active: `scale(0.96)` | Disabled: `#94d3a2`

#### Disable Button (`.disable-btn`)
```css
background: rgba(204, 204, 204, 1);
color: rgba(255, 255, 255, 1);
cursor: context-menu;
```

### Search Bar (`.searchbar`)
```css
display: flex;
align-items: center;
width: 35%;
background-color: white;
box-shadow: 0 0 0 1px #ccc;
height: 30px;
border-radius: 8px;
padding: 4px 10px;
```
Focus: `box-shadow: 0 0 0 1px #a6e301` (lime green ring)

### Status Badge / Pill (`.pills`)
```css
background-color: rgba(232, 245, 233, 1);  /* light green bg */
color: rgb(0 177 7);                        /* green text */
border-radius: 8px;
padding-inline: 10px;
font-size: small;
```

---

## 9. Tables & Listing Pages

### Table Container (`.table-responsive`)
```css
background-color: white;
overflow: auto;
height: 78vh;
scrollbar-width: thin;
border-radius: 10px;
border-bottom: 1px solid #c8c8c8;
```

### Table Head (`thead`)
```css
box-shadow: 0 1px #f2f2f2;
background-color: rgba(250, 252, 255, 1);
```
`th`: `color: #999999; padding-block: 12px`

### Table Body (`tbody`)
- `td`: `color: black; padding-block: 12px`
- Row divider: `border-bottom: 1px solid #f4f4f6`
- Highlighted row: `background-color: #edffbb`
- Action dropdown: `background: transparent; border: none`

### Listing Page Container (`.company-container`)
```css
margin: 1% 2%;
border: 1px solid #c8c8c8;
border-radius: 24px;
height: calc(100vh - 200px);
```

### Column — Profile/Name Link
```css
.name-box a { color: #0070b9; text-decoration: underline; }
.profile-pic { height: 42px; width: 44px; border-radius: 50%; }
```

### Filter Dropdown Wrapper (`.drop-wrapper`)
```css
border: 1px solid #eeeeee;
border-radius: 6px;
padding: 3px 0px 3px 10px;
```
Focus: `border-color: rgba(23, 95, 145, 1)`

---

## 10. Modals & Off-canvas Panels

### Modal Sizes
```css
.custom-modal        { --bs-modal-width: 65%; }
.custom-modal-dialog { max-width: 35%; }
```

### Modal Header (`.custom-modal-header`)
```css
border: none;
padding: 1.3rem 1.8rem 0.5rem 1.9rem;
```

### Modal Footer (`.custom-modal-footer`)
```css
border-top: 2px solid rgba(221, 221, 221, 1);
display: flex;
justify-content: end;
padding-left: 1.8rem;
margin-top: 1.5rem;
```

### Form Layout Inside Modal (`.selector`)
```css
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 20px;
```
- Label: `width: 40%`
- Input/Select: `width: 50%; border-radius: 10px`

### Off-canvas Footer Button
```css
border: 1px solid rgba(23, 95, 145, 1);  /* brand-blue-deep */
color: rgba(23, 95, 145, 1);
```

---

## 11. Toast Notifications

Toasts appear top-right, `z-index: 11111111111`, width `35vw`, `border-radius: 8px`.

| Type | Left accent bar | Body bg | Text color |
|---|---|---|---|
| **Success** | `rgba(58, 194, 121, 1)` (green) | `rgba(197, 247, 220, 1)` | `rgba(58, 194, 121, 1)` |
| **Error** | `rgba(233, 89, 76, 1)` (red) | `rgba(255, 207, 203, 1)` | `rgba(233, 89, 76, 1)` |
| **Processing** | `#dee2e6` (grey) | `#f8f9fa` | `#000` |

Entry animation: `animation-name: showSuccess; duration: 3s` (fade in from opacity 0 → 1 at 40%).

---

## 12. Login Page

**Component:** `LoginComponent` (`src/app/shared/components/login/`)

### Layout
- Full-viewport (`height: 100vh`), padded container `padding: 15px`
- Background: SVG `login_bg.svg` — cover, centered, `border-radius: 50px`
- Card centered: `max-width: 535px; border-radius: 30px; padding: 45px`
- Card shadow: `0px 8px 8px -4px #17171708, 0px 20px 24px -4px #17171714`

### Form Elements
- Input wrapper: `border: 1px solid #e0e0e0; border-radius: 10px; padding: 6px 12px`
- Submit button: `background: #0070b9; color: white; border-radius: 12px; width: 100%; padding: 10px 0`
- Forgot password link: `color: #0070b9; font-weight: 600; text-decoration: underline`
- Error container: `background: #fef3f2; border: 1px solid #ffcdc9; border-radius: 12px`

---

## 13. Landing Page

**Component:** `LandingPageComponent` (`src/app/shared/components/landing-page/`)

### Public Navbar
```css
padding-block: 1rem;
padding-inline: 6rem;
height: 8rem;
```
- Logo: `assets/images/onboarding/ic_brijj.svg`
- Nav links: `color: rgba(71, 85, 105, 1); font-weight: 700`
- Sign In button: `border: 1px solid rgba(203, 213, 225, 1); border-radius: 12px; height: 3rem; width: 5.62rem`
- Sign Up button: `background: rgba(33, 150, 243, 1); color: white`

### Hero Section
- Title: `font-size: 3.75rem; font-weight: 800; color: rgba(30, 41, 59, 1)`
- Body text: `font-size: 20px; color: rgba(71, 85, 105, 1)`
- Dashboard image: right half, `border-radius: 32px 0 0 32px`, bordered with `rgba(255,255,255,0.32)`

### Accent Colors (landing page specific)
- Sub-header pill: `background: rgba(227, 242, 253, 1); color: #0070b9; border-radius: 50px`
- Platforms strip: `background: rgba(248, 250, 252, 1)`
- Platform logo badge: `background: #dcfce7; border-radius: 12px`

---

## 14. Portal Contexts

The app serves two distinct portals, distinguished by `companyId` stored in user session:

| Context | Condition | Base Route | Description |
|---|---|---|---|
| **Admin Portal** | `companyId === -1` | `/admin-portal/` | RCS internal admin users — manage all companies, billing, users |
| **Company Portal** | `companyId > 0` | `/company-portal/` | Individual company users — manage their own data |

The `LayoutComponent` branches sidebar items and default routes based on this value.

---

## 15. Permissions System

- Library: **`ngx-permissions`**
- Applied via `[ngxPermissionsOnly]="['Permission:Action']"` structural directive on sidebar items and submenu items
- Permissions loaded on init from API via `MasterService.getRolesandPerm(appId)`
- Company portal submenu arrays are **filtered** to only include routes the user has permission for before being rendered
- Admin portal loads permissions but does not filter `allMenus` submenu arrays

---

## 16. Angular Material Theme

- Theme file: `src/custom-theme.scss`
- Prebuilt override: `@angular/material/prebuilt-themes/indigo-pink.css` (loaded in `styles.css`)
- Palette:
  - Primary: `mat.$indigo-palette`
  - Accent: `mat.$pink-palette` (A200, A100, A400)
  - Warn: `mat.$red-palette`
- Theme type: Light theme (`mat.define-light-theme`)
- **Note:** Angular Material is used for select components and toggles. The app heavily overrides Material styles with custom CSS. Do not rely on Material defaults for colors.

---

## 17. Key Asset Paths

| Asset | Path |
|---|---|
| Sidebar logo | `assets/images/onboarding/newbrijjlogo.svg` |
| Brand logo (full) | `assets/images/brijjworks_logo_primary.svg` |
| Brand icon | `assets/images/onboarding/ic_brijj.svg` |
| Login background | `assets/images/login_bg.svg` |
| Dashboard icon | `assets/images/duo-icons_dashboard.svg` |
| Company icon | `assets/images/duo-icons_building.svg` |
| User icon | `assets/images/duo-icons_user.svg` |
| Settings icon | `assets/images/duo-icons_settings.svg` |
| Product Management icon | `assets/images/ic_productManagment.svg` |
| Store Management icon | `assets/images/company-management/store_management.svg` |
| Warehouse icon | `assets/images/ic_warehouse.svg` |
| Default user avatar | `assets/images/company-management/ic_userSample.svg` |
| Dropdown arrow | `assets/images/icon-park_down.svg` |

---

## 18. Responsive Behavior

- Sidebar hides on screens < `lg` breakpoint (`d-none d-lg-block`) — no mobile sidebar nav is implemented at this time
- Login form card and reset-password card: full width below 768px, reduced padding below 480px (`padding: 20px 15px; border-radius: 15px`)
- Content area: `height: calc(100% - 5px)` on mobile (overrides the 100px navbar subtraction)
- Scrollbars: globally hidden via `::-webkit-scrollbar { display: none }`, `scrollbar-width: thin` on containers

---

## Quick Cheat Sheet for Agents

```
LAYOUT:    Flex row — [icon sidebar] + [navbar / content]
SIDEBAR:   White, border-right #eeeeee, icon-only, tooltip on hover
NAVBAR:    100px, border #eeeeee, breadcrumb left, user dropdown right
SUBMENU:   20rem panel, near-black active items (#181818)
COLORS:
  primary button  → #0070b9 (blue)
  accent/create   → #a6df0c (lime green)
  success action  → #269c41 (green)
  cancel/delete   → #f33b3b (red)
  active sidebar  → glow shadow on white bg
  active submenu  → #181818 dark pill
FONTS:     Roboto (body), Plus Jakarta Sans (.jakarta-font)
BORDERS:   Containers 24px radius, cards 10-30px radius
ICONS:     SVG files in assets/images/, Font Awesome for edge cases
```
