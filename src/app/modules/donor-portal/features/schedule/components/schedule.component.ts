import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { QrCodeComponent } from '../../../../../shared/components/qr-code/qr-code.component';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { CartItem, ScheduledVisit, NewCartItem } from '../models/schedule.models';
import { LocationStatus, LocationStatusLabel } from '../../../../../core/models/domain.models';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [FormsModule, DatePipe, ModalComponent, IconComponent, QrCodeComponent],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {
  protected svc = inject(MockDataService);
  protected toast = inject(ToastService);
  protected readonly LS = LocationStatus;
  protected readonly LSL = LocationStatusLabel;

  protected selLocation = '';
  protected selDate = '';
  protected selTime = '';
  protected notes = '';
  protected recurring = 'none';
  protected showAdd = signal(false);
  protected cart = signal<CartItem[]>([]);
  protected newItem: NewCartItem = { category: '', description: '', qty: 1 };
  protected selectedVisit = signal<ScheduledVisit | null>(null);
  protected showConfirmation = signal(false);
  protected confirmationId = signal<string>('');
  protected confirmationData = signal<{
    location: string;
    date: string;
    time: string;
    recurring: string;
    items: number;
  }>({ location: '', date: '', time: '', recurring: '', items: 0 });

  readonly today = new Date().toISOString().split('T')[0];
  readonly timeSlots = [
    '9:00 AM',
    '10:00 AM',
    '11:00 AM',
    '12:00 PM',
    '1:00 PM',
    '2:00 PM',
    '3:00 PM',
    '4:00 PM',
    '5:00 PM'
  ];
  readonly recurringOpts = [
    { value: 'none', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 Weeks' },
    { value: 'monthly', label: 'Monthly' }
  ];
  readonly upcoming: ScheduledVisit[] = [
    { id: 'APT-20260322-001', date: '2026-03-22', day: '22', month: 'MAR', location: 'Downtown Store', time: '10:00 AM', items: 8,  recurring: 'One-time' },
    { id: 'APT-20260405-002', date: '2026-04-05', day: '5',  month: 'APR', location: 'Downtown Store', time: '2:00 PM',  items: 3,  recurring: 'Monthly' }
  ];

  get totalCartItems(): number {
    return this.cart().reduce((s, i) => s + i.qty, 0);
  }

  addCartItem(): void {
    if (!this.newItem.category) return;
    const cat = this.svc.categories.find(c => c.name === this.newItem.category);
    this.cart.update(items => [
      ...items,
      {
        id: String(Date.now()),
        category: this.newItem.category,
        icon: cat?.icon ?? '📦',
        description: this.newItem.description,
        qty: this.newItem.qty
      }
    ]);
    this.newItem = { category: '', description: '', qty: 1 };
    this.showAdd.set(false);
  }

  removeCartItem(id: string): void {
    this.cart.update(items => items.filter(i => i.id !== id));
  }

  submit(): void {
    if (!this.selLocation || !this.selDate) return;
    const loc = this.svc.locations.find(l => l.id === this.selLocation);
    // Generate appointment ID
    const scheduledDonationId = `APT${Date.now()}`;
    this.confirmationId.set(scheduledDonationId);
    this.confirmationData.set({
      location: loc?.name || '',
      date: this.selDate,
      time: this.selTime || 'Not specified',
      recurring: this.recurringOpts.find(r => r.value === this.recurring)?.label || 'One-time',
      items: this.totalCartItems
    });
    this.showConfirmation.set(true);
  }

  viewVisit(v: ScheduledVisit): void {
    this.selectedVisit.set(v);
  }

  closeVisitDetail(): void {
    this.selectedVisit.set(null);
  }

  /** Generate a pseudo-random QR grid from the appointment ID string */
  qrPattern(id: string): boolean[][] {
    const size = 9;
    return Array.from({ length: size }, (_, y) =>
      Array.from({ length: size }, (_, x) => {
        const idx = (y * size + x) % id.length;
        return (id.charCodeAt(idx) + x + y) % 2 === 0;
      })
    );
  }

  closeConfirmation(): void {
    this.showConfirmation.set(false);
    const data = this.confirmationData();
    this.toast.success(
      '📅 Donation Scheduled!',
      `See you at ${data.location} on ${new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
    );
    this.selLocation = '';
    this.selDate = '';
    this.selTime = '';
    this.notes = '';
    this.recurring = 'none';
    this.cart.set([]);
  }
}
