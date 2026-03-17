import { Component, Input, HostListener, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IconComponent, IconName } from '../icon/icon.component';

export interface DonorNavItem {
  label: string;
  icon: IconName;
  route: string;
  badge?: string | number;
}
export interface DonorNavSection {
  title: string;
  items: DonorNavItem[];
}

@Component({
  selector: 'app-donor-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  templateUrl: './donor-layout.component.html',
  styleUrl: './donor-layout.component.scss'
})
export class DonorLayoutComponent implements OnInit, OnDestroy {
  @Input() moduleLabel = '';
  @Input() sections: DonorNavSection[] = [];
  @Input() userName = '';
  @Input() userInitials = '';
  @Input() userRole = '';
  @Input() logoutRoute = '';

  dropdownOpen = false;
  activeCrumb = '';
  private sub!: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.activeCrumb = this.getRouteTitle();
    this.sub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => (this.activeCrumb = this.getRouteTitle()));
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  toggleDropdown(e: Event) {
    e.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.dropdownOpen = false;
  }

  private getRouteTitle(): string {
    let r = this.route.root;
    let label = '';
    while (r.firstChild) {
      r = r.firstChild;
      if (r.snapshot.data['breadcrumb']) label = r.snapshot.data['breadcrumb'];
    }
    return label || this.moduleLabel;
  }
}
