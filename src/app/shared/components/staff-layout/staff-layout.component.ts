import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { IconComponent, IconName } from '../icon/icon.component';
import { CurrentUserService } from '../../../core/services/current-user.service';
import { DevAuthService } from '../../../core/services/dev-auth.service';

export interface StaffNavItem {
  label: string;
  icon: IconName;
  route: string;
  badge?: string | number;
}
export interface StaffNavSection {
  title: string;
  items: StaffNavItem[];
}

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './staff-layout.component.html',
  styleUrl: './staff-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffLayoutComponent implements OnInit {
  sections = input<StaffNavSection[]>([]);
  moduleLabel = input('');
  logoutRoute = input('');

  protected readonly currentUser = inject(CurrentUserService);
  private readonly devAuth = inject(DevAuthService);
  dropdownOpen = signal(false);
  activeCrumb = signal('');

  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.activeCrumb.set(this.getRouteTitle());
    this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.activeCrumb.set(this.getRouteTitle()));
  }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.dropdownOpen.update(v => !v);
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && this.dropdownOpen()) {
      this.dropdownOpen.set(false);
    }
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen.set(false);
  }

  signOut(): void {
    this.devAuth.logout();
    this.router.navigate([this.logoutRoute() || '/staff/login']);
  }

  private getRouteTitle(): string {
    let r = this.route.root;
    let label = '';
    while (r.firstChild) {
      r = r.firstChild;
      if (r.snapshot.data['breadcrumb']) label = r.snapshot.data['breadcrumb'];
    }
    return label || this.moduleLabel();
  }
}
