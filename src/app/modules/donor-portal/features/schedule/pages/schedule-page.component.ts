import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { ToastService } from '@core/services/toast.service';
import { ScheduleService } from '../services/schedule.service';
import { ScheduleFormComponent } from '../components/schedule-form/schedule-form.component';
import { CartEditorComponent } from '../components/cart-editor/cart-editor.component';
import { UpcomingVisitsListComponent } from '../components/upcoming-visits-list/upcoming-visits-list.component';
import { VisitDetailModalComponent } from '../components/visit-detail-modal/visit-detail-modal.component';
import { ScheduleConfirmationModalComponent } from '../components/schedule-confirmation-modal/schedule-confirmation-modal.component';
import { CartItemState, NewCartItemState, ScheduledVisitState, ConfirmationState } from '../models/schedule.state';

@Component({
  selector: 'app-schedule-page',
  standalone: true,
  imports: [
    ScheduleFormComponent,
    CartEditorComponent,
    UpcomingVisitsListComponent,
    VisitDetailModalComponent,
    ScheduleConfirmationModalComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-page.component.html',
  styleUrl: './schedule-page.component.scss',
})
export class SchedulePageComponent {
  private readonly scheduleService = inject(ScheduleService);
  private readonly toast = inject(ToastService);

  protected readonly locations = this.scheduleService.getLocations();
  protected readonly categories = this.scheduleService.getCategoryNames();
  protected readonly today = new Date().toISOString().split('T')[0];
  protected readonly timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  ];
  protected readonly recurringOpts = [
    { value: 'none', label: 'One-time' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'biweekly', label: 'Every 2 Weeks' },
    { value: 'monthly', label: 'Monthly' },
  ];

  protected selectedLocation = signal<number | null>(null);
  protected selectedDate = signal('');
  protected selectedTime = signal('');
  protected notes = signal('');
  protected cart = signal<CartItemState[]>([]);
  protected selectedVisit = signal<ScheduledVisitState | null>(null);
  protected showConfirmation = signal(false);
  protected confirmation = signal<ConfirmationState>({
    id: '', location: '', date: '', time: '', recurring: '', items: 0,
  });

  readonly upcoming: ScheduledVisitState[] = [
    { referenceNumber: 'APT-20260322-001', date: '2026-03-22', day: '22', month: 'MAR', location: 'Downtown Store', time: '10:00 AM', items: 8, recurring: 'One-time' },
    { referenceNumber: 'APT-20260405-002', date: '2026-04-05', day: '5', month: 'APR', location: 'Downtown Store', time: '2:00 PM', items: 3, recurring: 'Monthly' },
  ];

  get totalCartItems(): number {
    return this.cart().reduce((s, i) => s + i.qty, 0);
  }

  onAddCartItem(item: NewCartItemState): void {
    this.cart.update(items => [
      ...items,
      { id: String(Date.now()), category: item.category, description: item.description, qty: item.qty },
    ]);
  }

  onRemoveCartItem(id: string): void {
    this.cart.update(items => items.filter(i => i.id !== id));
  }

  onSubmit(): void {
    const locId = this.selectedLocation();
    if (!locId || !this.selectedDate()) return;
    const loc = this.locations.find(l => l.id === locId);
    const scheduledId = `APT-${Date.now()}`;
    this.confirmation.set({
      id: scheduledId,
      location: loc?.name || '',
      date: this.selectedDate(),
      time: this.selectedTime() || 'Not specified',
      recurring: this.recurringOpts.find(r => r.value === 'none')?.label || 'One-time',
      items: this.totalCartItems,
    });
    this.showConfirmation.set(true);
  }

  onViewVisit(visit: ScheduledVisitState): void {
    this.selectedVisit.set(visit);
  }

  onCancelVisit(_visit: ScheduledVisitState): void {
    this.toast.info('Cancelled', 'Scheduled donation cancelled.');
  }

  onCloseVisitDetail(): void {
    this.selectedVisit.set(null);
  }

  onCloseConfirmation(): void {
    this.showConfirmation.set(false);
    const data = this.confirmation();
    this.toast.success(
      'Donation Scheduled!',
      `See you at ${data.location} on ${new Date(data.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`
    );
    this.selectedLocation.set(null);
    this.selectedDate.set('');
    this.selectedTime.set('');
    this.notes.set('');
    this.cart.set([]);
  }
}
