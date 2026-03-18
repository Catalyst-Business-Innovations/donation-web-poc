import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { NewDonationStateService } from '../services/new-donation-state.service';
import { MockDataService } from '../../../../../core/services/mock-data.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { NewDonationMapper } from '../models/new-donation.mapper';
import { SelectedDonor, EnrollForm } from '../models/new-donation.state';
import { DonorTier, ScheduledDonation, DonationStatus, DonationStatusLabel, Container, ContainerStatus, ContainerStatusLabel, ContainerType, ContainerTypeLabel, DonationScope, ReceiptDelivery, Donor } from '../../../../../core/models/domain.models';

import { ModalComponent } from '../../../../../shared/components/modal/modal.component';
import { IconComponent, IconName } from '../../../../../shared/components/icon/icon.component';
import { QrCodeComponent } from '../../../../../shared/components/qr-code/qr-code.component';

@Component({
  selector: 'app-new-donation',
  standalone: true,
  imports: [FormsModule, DecimalPipe, DatePipe, ModalComponent, IconComponent, QrCodeComponent],
  templateUrl: './new-donation.component.html',
  styleUrl: './new-donation.component.scss'
})
export class NewDonationComponent {
  protected st = inject(NewDonationStateService);
  protected mockData = inject(MockDataService);
  protected toast = inject(ToastService);

  protected searchQ = signal<string>('');
  protected showEnroll = signal(false);
  protected sdQ = '';
  protected sdResults = signal<ScheduledDonation[]>([]);
  protected sdNotFound = signal(false);
  protected activeDept = signal('clothes');
  protected selectedContainer = signal<Container | null>(null);
  protected showContainerPicker = signal(false);
  protected containerSearchQ = signal('');
  protected monetary = signal<number | null>(null);
  protected customMon = signal(false);
  protected paymentMethod = signal<'cash' | 'card' | null>(null);
  protected cashTendered = signal<number | null>(null);
  protected cardApproved = signal(false);
  protected delivery = signal<ReceiptDelivery>(ReceiptDelivery.Email);
  protected readonly AS = DonationStatus;
  protected readonly RD = ReceiptDelivery;
  protected readonly CS = ContainerStatus;
  protected readonly DT = DonationScope;
  protected receiptNum = this.mockData.newReceipt();
  protected showConfirmation = signal(false);
  protected donationId = signal<number>(0);
  protected readonly today = new Date();

  // Phase 2 — Post-payment donor association (Req 1)
  protected showAssociateModal = signal(false);
  protected associateSearchQ = signal('');
  protected associatedDonor = signal<SelectedDonor | null>(null);

  readonly isCashAccepted = computed(() => this.mockData.appConfig().isCashAccepted);

  readonly associateResults = computed<SelectedDonor[]>(() => {
    const q = this.associateSearchQ().toLowerCase();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(d => `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q))
      .map(NewDonationMapper.donorToSelected);
  });

  protected enrollForm: EnrollForm = { firstName: '', lastName: '', phone: '', email: '' };

  readonly steps = computed(() => {
    const t = this.st.donationType();
    const base = [
      { n: 1, label: 'Identify Donor' },
      { n: 2, label: 'Donation Type' },
    ];
    if (t === DonationScope.Monetary) return [...base, { n: 3, label: 'Add Money' }, { n: 4, label: 'Review' }];
    if (t === DonationScope.Both)     return [...base, { n: 3, label: 'Add Items' }, { n: 4, label: 'Add Money' }, { n: 5, label: 'Review' }];
    return [...base, { n: 3, label: 'Add Items' }, { n: 4, label: 'Review' }];
  });

  readonly topTitle = computed(() => {
    const s = this.st.step(), dt = this.st.donationType();
    if (s === 1) return 'Identify Donor';
    if (s === 2) return 'Select Donation Type';
    if (s === 3) return dt === DonationScope.Monetary ? 'Add Money' : 'Add Items';
    if (s === 4) return dt === DonationScope.Both ? 'Add Money' : 'Review & Complete';
    return 'Review & Complete';
  });

  readonly topSubtitle = computed(() => {
    const s = this.st.step(), dt = this.st.donationType();
    if (s === 1) return 'Scan QR, search by phone, or continue anonymously';
    if (s === 2) return "Select how you'd like to donate today";
    if (this.isAddMoneyStep()) return 'Select amount and payment method';
    if (this.isAddItemsStep()) return 'Quick-tap categories — complete in under 10 seconds';
    return 'Confirm details and generate receipt';
  });

  readonly isAddItemsStep = computed(() =>
    this.st.step() === 3 && this.st.donationType() !== DonationScope.Monetary
  );

  readonly isAddMoneyStep = computed(() => {
    const s = this.st.step(), dt = this.st.donationType();
    return (s === 3 && dt === DonationScope.Monetary) || (s === 4 && dt === DonationScope.Both);
  });

  readonly isReviewStep = computed(() => {
    const s = this.st.step(), dt = this.st.donationType();
    return (s === 4 && dt !== DonationScope.Both) || s === 5;
  });

  readonly canProceedFromMoney = computed(() => {
    const amt = this.monetary() ?? 0;
    const method = this.paymentMethod();
    if (amt <= 0 || !method) return false;
    if (method === 'cash') return (this.cashTendered() ?? 0) >= amt;
    return this.cardApproved();
  });

  protected readonly canComplete = computed(() => {
    const type = this.st.donationType();
    if (!type) return false;
    if (type === DonationScope.Items)    return this.st.totalItems() > 0;
    if (type === DonationScope.Monetary) return this.canProceedFromMoney();
    return this.st.totalItems() > 0 && this.canProceedFromMoney();
  });

  readonly deliveryOpts: { value: ReceiptDelivery; icon: IconName; label: string }[] = [
    { value: ReceiptDelivery.Email, icon: 'mail',     label: 'Email' },
    { value: ReceiptDelivery.SMS,   icon: 'send',     label: 'SMS' },
    { value: ReceiptDelivery.Print, icon: 'printer',  label: 'Print' },
    { value: ReceiptDelivery.None,  icon: 'x-circle', label: 'No Receipt' }
  ];

  readonly searchResults = computed<SelectedDonor[]>(() => {
    const q = this.searchQ().toLowerCase();
    if (q.length < 2) return [];
    return this.mockData.donors
      .filter(d => `${d.firstName} ${d.lastName} ${d.phone}`.toLowerCase().includes(q))
      .map(NewDonationMapper.donorToSelected);
  });

  readonly availableContainers = computed<Container[]>(() => {
    const q = this.containerSearchQ().toLowerCase();
    return this.mockData.containers
      .filter(c => c.status === ContainerStatus.Available || c.status === ContainerStatus.ReadyForSorting || c.status === ContainerStatus.Sorting)
      .filter(c => !q || c.barcode.toLowerCase().includes(q)
        || (c.donorVisitLabel ?? '').toLowerCase().includes(q)
        || String(c.containerType).toLowerCase().includes(q)
      );
  });

  readonly reviewItems = computed(() => {
    return Object.entries(this.st.selectedItems()).map(([key, entry]) => {
      const parts = key.split('::');
      const dept = this.mockData.departments.find(d => d.key === parts[0]);
      const cat  = parts[1] ? dept?.categories.find(c => c.key === parts[1]) : null;
      const sub  = (parts[2] && cat) ? cat.subCategories?.find(s => s.key === parts[2]) : null;
      const base = sub?.estimatedValue ?? cat?.estimatedValue ?? dept?.estimatedValue ?? 0;
      const name = sub ? `${cat!.name} › ${sub.name}`
                       : cat ? cat.name
                             : `${dept?.name ?? key} (Any)`;
      return { key, name, qty: entry.qty, total: (entry.estimatedValue ?? base) * entry.qty };
    });
  });

  protected containerTypeLabel(t: ContainerType): string { return ContainerTypeLabel[t] ?? String(t); }
  protected containerStatusLabel(s: ContainerStatus): string { return ContainerStatusLabel[s] ?? String(s); }
  protected sdStatusLabel(s: DonationStatus): string { return DonationStatusLabel[s] ?? String(s); }

  tierCfg(t: DonorTier) {
    return this.mockData.getTier(t);
  }

  selectType(t: DonationScope): void {
    this.st.setDonationType(t);
    this.st.nextStep();
  }

  lookupScheduledDonation(): void {
    const raw = this.sdQ.trim();
    if (!raw) return;
    const q = raw.toLowerCase();
    const qDigits = q.replace(/\D/g, '');
    const results = this.mockData.getScheduledDonations().filter(a =>
      a.referenceNumber.toLowerCase().includes(q) ||
      a.donorName.toLowerCase().includes(q) ||
      (qDigits.length >= 3 && (a.donorPhone ?? '').replace(/\D/g, '').includes(qDigits))
    );
    this.sdResults.set(results);
    this.sdNotFound.set(results.length === 0);
  }

  demoScanSdQR(): void {
    const scheduled = this.mockData.getScheduledDonations().filter(a => a.status === DonationStatus.Scheduled);
    if (scheduled.length) {
      this.sdQ = scheduled[0].referenceNumber;
      this.lookupScheduledDonation();
      this.toast.info('QR Scanned', `Scheduled donation ID read: ${scheduled[0].referenceNumber}`);
    }
  }

  loadScheduledDonation(appt: ScheduledDonation): void {
    // Set donor
    const donor = appt.donorId ? this.mockData.donors.find(d => d.id === appt.donorId) : null;
    this.st.setDonor(donor ? NewDonationMapper.donorToSelected(donor) : null);

    // Pre-fill items from scheduled donation categories (1 qty each)
    for (const catName of appt.categories ?? []) {
      for (const dept of this.mockData.departments) {
        const cat = dept.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (cat) {
          this.st.setQty(NewDonationMapper.itemKey(dept.key, cat.key), 1);
          break;
        }
      }
    }

    this.toast.success('Scheduled Donation Loaded', `${appt.referenceNumber} — ${appt.donorName}`);
    this.sdResults.set([]);
    this.sdQ = '';
    this.sdNotFound.set(false);
    this.st.setDonationType(DonationScope.Items);
    this.st.goToStep(3);
  }

  sdStatusBadge(status: DonationStatus): string {
    const map: Record<DonationStatus, string> = {
      [DonationStatus.Scheduled]:  'badge-info',
      [DonationStatus.CheckedIn]:  'badge-warning',
      [DonationStatus.Completed]:  'badge-success',
      [DonationStatus.Cancelled]:  'badge-danger',
      [DonationStatus.NoShow]:     'badge-danger'
    };
    return map[status] ?? 'badge-gray';
  }

  selectDonor(d: SelectedDonor): void {
    this.st.setDonor(d);
    this.toast.success('Donor found', `Welcome back, ${d.displayName}!`);
  }

  selectAnonymous(): void {
    this.st.setDonor(null);
  }

  demoScanDonorQR(): void {
    const donors = this.mockData.donors;
    if (!donors.length) return;
    const random = donors[Math.floor(Math.random() * donors.length)];
    const selected = NewDonationMapper.donorToSelected(random);
    this.toast.info('QR Scanned', `Donor ID read: ${random.id}`);
    this.selectDonor(selected);
  }

  demoSearch(): void {
    const donors = this.mockData.donors;
    if (!donors.length) return;
    const random = donors[Math.floor(Math.random() * donors.length)];
    // Use first 3 chars of first name so multiple results may appear
    const q = random.firstName.slice(0, 3);
    this.searchQ.set(q);
    this.toast.info('Demo Search', `Searching for "${q}"`);
  }

  selectPaymentMethod(m: 'cash' | 'card'): void {
    this.paymentMethod.set(m);
    this.cardApproved.set(false);
    this.cashTendered.set(null);
  }

  simulateCardTap(): void {
    this.cardApproved.set(true);
    this.toast.success('Card Approved', 'Payment authorised successfully.');
  }

  quickDonate(type: DonationScope): void {
    this.st.setDonor(null);
    this.st.setDonationType(type);
    this.st.goToStep(3);
  }
  clearDonor(): void {
    this.st.setDonor(undefined);
    this.searchQ.set('');
  }

  enrollDonor(): void {
    const { firstName, lastName, phone } = this.enrollForm;
    if (!firstName || !lastName || !phone) {
      this.toast.warning('Missing info', 'Name and phone required.');
      return;
    }
    const d: SelectedDonor = {
      id: Date.now(),
      displayName: `${firstName} ${lastName}`,
      initials: `${firstName[0]}${lastName[0]}`.toUpperCase(),
      tier: DonorTier.Bronze,
      points: 0,
      totalDonations: 0
    };
    this.st.setDonor(d);
    this.showEnroll.set(false);
    this.toast.success('Enrolled!', `${d.displayName} registered.`);
    this.st.nextStep();
  }

  key(dept: string, cat?: string | null, sub?: string | null): string {
    return NewDonationMapper.itemKey(dept, cat, sub);
  }
  getQty(dept: string, cat?: string | null, sub?: string | null): number {
    return this.st.selectedItems()[this.key(dept, cat, sub)]?.qty ?? 0;
  }
  getEstVal(dept: string, cat?: string | null, sub?: string | null): string {
    const v = this.st.selectedItems()[this.key(dept, cat, sub)]?.estimatedValue;
    return v !== undefined ? String(v) : '';
  }
  adjust(k: string, d: number): void {
    this.st.setQty(k, d);
  }
  addOne(k: string): void {
    this.st.setQty(k, 1);
  }
  setVal(cat: string, sub: string | null, v: number): void {
    this.st.setItemValue(this.key(cat, sub), v);
  }

  deptCount(deptKey: string): number {
    return Object.entries(this.st.selectedItems())
      .filter(([k]) => k === deptKey || k.startsWith(deptKey + '::'))
      .reduce((s, [, v]) => s + v.qty, 0);
  }

  setMonetary(amt: number): void {
    this.monetary.set(amt);
    this.customMon.set(false);
    this.paymentMethod.set(null);
    this.cashTendered.set(null);
    this.cardApproved.set(false);
  }

  complete(): void {
    const d = this.st.donor();
    // Generate donation ID
    const newDonationId = Date.now();
    this.donationId.set(newDonationId);
    this.showConfirmation.set(true);
  }

  closeConfirmation(): void {
    this.showConfirmation.set(false);
    const d = this.st.donor();
    this.toast.success(
      '🎉 Donation Complete!',
      d ? `Points awarded to ${d.displayName}.` : 'Anonymous donation recorded.'
    );
    this.st.reset();
    this.receiptNum = this.mockData.newReceipt();
    this.monetary.set(null);
    this.customMon.set(false);
    this.paymentMethod.set(null);
    this.cashTendered.set(null);
    this.cardApproved.set(false);
    this.delivery.set(ReceiptDelivery.Email);
    this.showEnroll.set(false);
    this.searchQ.set('');
    this.sdQ = '';
    this.sdResults.set([]);
    this.sdNotFound.set(false);
    this.showAssociateModal.set(false);
    this.associatedDonor.set(null);
    this.associateSearchQ.set('');
  }

  confirmAssociation(): void {
    const donor = this.associatedDonor();
    if (!donor) return;
    this.mockData.associateDonorToDonation(this.donationId(), donor.id);
    this.toast.success('Donor Linked!', `Donation associated with ${donor.displayName}.`);
    this.showAssociateModal.set(false);
    this.associatedDonor.set(null);
    this.associateSearchQ.set('');
  }

  cancel(): void {
    this.st.reset();
    this.monetary.set(null);
    this.customMon.set(false);
    this.paymentMethod.set(null);
    this.cashTendered.set(null);
    this.cardApproved.set(false);
    this.delivery.set(ReceiptDelivery.Email);
    this.showEnroll.set(false);
    this.searchQ.set('');
    this.sdQ = '';
    this.sdResults.set([]);
    this.sdNotFound.set(false);
  }
}
