import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { NewDonationStateService } from '../services/new-donation-state.service';
import { NewDonationService } from '../services/new-donation.service';
import { ToastService } from '@core/services/toast.service';
import {
  buildSteps,
  buildReviewItems,
  isAddItemsStep,
  isAddMoneyStep,
  isReviewStep,
  getTopTitle,
  getTopSubtitle,
  mapDonorToSelected,
  buildItemKey
} from '../models/new-donation.mapper';
import { SelectedDonor, EnrollForm } from '../models/new-donation.state';
import { PaymentMethodType } from '../models/new-donation.enum';
import {
  DonorTier,
  DonationScope,
  ReceiptDelivery,
  ScheduledDonation,
  ContainerStatus,
  Container,
  ContainerType
} from '@core/models/domain.models';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';

import { DonationStepperComponent } from '../components/donation-stepper/donation-stepper.component';
import {
  DonorIdentifyStepComponent,
  QuickDonateEvent
} from '../components/donor-identify-step/donor-identify-step.component';
import { DonationTypeStepComponent } from '../components/donation-type-step/donation-type-step.component';
import { AddItemsStepComponent } from '../components/add-items-step/add-items-step.component';
import { AddMoneyStepComponent } from '../components/add-money-step/add-money-step.component';
import { ReviewStepComponent } from '../components/review-step/review-step.component';
import { DonationConfirmationModalComponent } from '../components/donation-confirmation-modal/donation-confirmation-modal.component';

@Component({
  selector: 'app-new-donation-page',
  standalone: true,
  imports: [
    FormsModule,
    DecimalPipe,
    IconComponent,
    ModalComponent,
    DonationStepperComponent,
    DonorIdentifyStepComponent,
    DonationTypeStepComponent,
    AddItemsStepComponent,
    AddMoneyStepComponent,
    ReviewStepComponent,
    DonationConfirmationModalComponent
  ],
  templateUrl: './new-donation-page.component.html',
  styleUrl: './new-donation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewDonationPageComponent implements OnInit, OnDestroy {
  protected readonly st = inject(NewDonationStateService);
  protected readonly svc = inject(NewDonationService);
  private readonly toast = inject(ToastService);

  private terminalChannel!: BroadcastChannel;
  private terminalWindow: Window | null = null;

  // Local UI signals
  protected searchQ = signal('');
  protected sdResults = signal<ScheduledDonation[]>([]);
  protected sdNotFound = signal(false);
  protected monetary = signal<number | null>(null);
  protected paymentMethod = signal<PaymentMethodType | null>(null);
  protected cashTendered = signal<number | null>(null);
  protected cardApproved = signal(false);
  protected cardDeclined = signal(false);
  protected cardDeclineReason = signal('');
  protected cardTxnRef = signal('');
  protected terminalWaiting = signal(false);
  protected delivery = signal<ReceiptDelivery>(ReceiptDelivery.Print);
  protected showConfirmation = signal(false);
  protected donationId = signal<number>(0);
  protected donationRefNumber = signal('');
  protected receiptNum = this.svc.newReceipt();
  protected associateSearchQ = signal('');
  protected selectedContainer = signal<Container | null>(null);
  protected showContainerPicker = signal(false);
  protected containerSearchQ = signal('');

  protected readonly DT = DonationScope;
  protected readonly CS = ContainerStatus;
  protected readonly RD = ReceiptDelivery;

  // Computed values
  readonly steps = computed(() => buildSteps(this.st.donationType()));

  readonly topTitle = computed(() => getTopTitle(this.st.step(), this.st.donationType()));
  readonly topSubtitle = computed(() => getTopSubtitle(this.st.step(), this.st.donationType()));

  readonly isAddItemsStep = computed(() => isAddItemsStep(this.st.step(), this.st.donationType()));
  readonly isAddMoneyStep = computed(() => isAddMoneyStep(this.st.step(), this.st.donationType()));
  readonly isReviewStep = computed(() => isReviewStep(this.st.step(), this.st.donationType()));

  readonly isCashAccepted = computed(() => this.svc.isCashAccepted());

  readonly searchResults = computed(() => this.svc.searchDonors(this.searchQ()));

  readonly reviewItems = computed(() => buildReviewItems(this.st.selectedItems(), this.svc.departments));

  readonly canProceedFromMoney = computed(() => {
    const amt = this.monetary() ?? 0;
    const method = this.paymentMethod();
    if (amt <= 0 || !method) return false;
    if (method === 'cash') return (this.cashTendered() ?? 0) >= amt;
    return this.cardApproved();
  });

  readonly canComplete = computed(() => {
    const type = this.st.donationType();
    if (!type) return false;
    if (type === DonationScope.Items) return this.st.totalItems() > 0;
    if (type === DonationScope.Monetary) return this.canProceedFromMoney();
    return this.st.totalItems() > 0 && this.canProceedFromMoney();
  });

  readonly associateResults = computed(() => this.svc.searchDonors(this.associateSearchQ()));

  readonly availableContainers = computed(() => this.svc.getAvailableContainers(this.containerSearchQ()));

  readonly tierCfgFn = (t: DonorTier) => this.svc.getTierConfig(t);

  ngOnInit(): void {
    this.terminalChannel = new BroadcastChannel('card-terminal');
    this.terminalChannel.onmessage = (event: MessageEvent) => {
      const data = event.data;

      // Validate message structure before processing
      if (typeof data !== 'object' || data === null || !('type' in data)) return;
      if (!['approved', 'declined'].includes(data.type)) return;

      if (data.type === 'approved') {
        this.cardApproved.set(true);
        this.cardDeclined.set(false);
        this.cardDeclineReason.set('');
        this.cardTxnRef.set(typeof data.txnRef === 'string' ? data.txnRef : '');
        this.terminalWaiting.set(false);
        this.toast.success('Card Approved', 'Payment authorised successfully.');
      } else if (data.type === 'declined') {
        this.cardDeclined.set(true);
        this.cardApproved.set(false);
        this.cardDeclineReason.set(typeof data.reason === 'string' ? data.reason : 'Unknown error');
        this.cardTxnRef.set('');
        this.terminalWaiting.set(false);
        this.toast.warning('Card Declined', typeof data.reason === 'string' ? data.reason : 'Unknown error');
      }
    };
  }

  ngOnDestroy(): void {
    this.terminalChannel?.close();
    if (this.terminalWindow && !this.terminalWindow.closed) {
      this.terminalWindow.close();
    }
  }

  // --- Event handlers from child components ---

  onDonorSelected(d: SelectedDonor): void {
    this.st.setDonor(d);
    this.searchQ.set('');
    this.toast.success('Donor found', `Welcome back, ${d.displayName}!`);
  }

  onAnonymousSelected(): void {
    this.st.setDonor(null);
  }

  onDonorEnrolled(form: EnrollForm): void {
    if (!form.firstName || !form.lastName || !form.phone) {
      this.toast.warning('Missing info', 'Name and phone required.');
      return;
    }
    const d: SelectedDonor = {
      id: Date.now(),
      displayName: `${form.firstName} ${form.lastName}`,
      initials: `${form.firstName?.[0] ?? ''}${form.lastName?.[0] ?? ''}`.toUpperCase(),
      tier: DonorTier.Bronze,
      points: 0,
      totalDonations: 0
    };
    this.st.setDonor(d);
    this.toast.success('Enrolled!', `${d.displayName} registered.`);
    this.st.nextStep();
  }

  onScanQR(): void {
    const random = this.svc.getRandomDonor();
    if (!random) return;
    const selected = mapDonorToSelected(random);
    this.toast.info('QR Scanned', `Donor ID read: ${random.id}`);
    this.onDonorSelected(selected);
  }

  onSearchChanged(q: string): void {
    this.searchQ.set(q);
  }

  onQuickDonate(event: QuickDonateEvent): void {
    this.st.setDonor(null);
    this.st.setDonationType(event.type);
    this.st.goToStep(3);
  }

  onScheduledLookup(query: string): void {
    const results = this.svc.lookupScheduledDonations(query);
    this.sdResults.set(results);
    this.sdNotFound.set(results.length === 0);
  }

  onScheduledScanQR(): void {
    const scheduled = this.svc.getFirstScheduledDonation();
    if (scheduled) {
      this.onScheduledLookup(scheduled.referenceNumber);
      this.toast.info('QR Scanned', `Scheduled donation ID read: ${scheduled.referenceNumber}`);
    }
  }

  onScheduledLoad(appt: ScheduledDonation): void {
    const donor = appt.donorId ? this.svc.findDonorById(appt.donorId) : null;
    this.st.setDonor(donor ? mapDonorToSelected(donor) : null);

    for (const catName of appt.categories ?? []) {
      for (const dept of this.svc.departments) {
        const cat = dept.categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
        if (cat) {
          this.st.setQty(buildItemKey(dept.key, cat.key), 1);
          break;
        }
      }
    }

    this.toast.success('Scheduled Donation Loaded', `${appt.referenceNumber} — ${appt.donorName}`);
    this.sdResults.set([]);
    this.sdNotFound.set(false);
    this.st.setDonationType(DonationScope.Items);
    this.st.goToStep(3);
  }

  onTypeSelected(t: DonationScope): void {
    this.st.setDonationType(t);
    this.st.nextStep();
  }

  onItemAdjusted(event: { key: string; delta: number }): void {
    this.st.setQty(event.key, event.delta);
  }

  onMonetaryChanged(amt: number | null): void {
    this.monetary.set(amt);
    this.paymentMethod.set(null);
    this.cashTendered.set(null);
    this.cardApproved.set(false);
  }

  onPaymentMethodSelected(method: PaymentMethodType): void {
    this.paymentMethod.set(method);
    this.cardApproved.set(false);
    this.cardDeclined.set(false);
    this.cardDeclineReason.set('');
    this.cashTendered.set(null);
    if (method === 'card') {
      this.openTerminalSimulator();
    }
  }

  onCashTenderedChanged(value: number | null): void {
    this.cashTendered.set(value);
  }

  onCardRetry(): void {
    this.cardDeclined.set(false);
    this.cardDeclineReason.set('');
    this.openTerminalSimulator();
  }

  onDeliveryChanged(value: ReceiptDelivery): void {
    this.delivery.set(value);
  }

  onComplete(): void {
    const newDonationId = Date.now();
    this.donationId.set(newDonationId);
    this.donationRefNumber.set(`DON-${newDonationId}`);
    this.showConfirmation.set(true);
  }

  onConfirmationClosed(): void {
    this.showConfirmation.set(false);
    const d = this.st.donor();
    this.toast.success(
      'Donation Complete!',
      d ? `Points awarded to ${d.displayName}.` : 'Anonymous donation recorded.'
    );
    this.resetAll();
  }

  onAssociateSearchChanged(q: string): void {
    this.associateSearchQ.set(q);
  }

  onConfirmAssociation(donor: SelectedDonor): void {
    this.svc.associateDonorToDonation(this.donationId(), donor.id);
    this.toast.success('Donor Linked!', `Donation associated with ${donor.displayName}.`);
    this.associateSearchQ.set('');
  }

  clearDonor(): void {
    this.st.setDonor(undefined);
    this.searchQ.set('');
  }

  cancel(): void {
    this.resetAll();
  }

  private resetAll(): void {
    this.st.reset();
    this.receiptNum = this.svc.newReceipt();
    this.monetary.set(null);
    this.paymentMethod.set(null);
    this.cashTendered.set(null);
    this.cardApproved.set(false);
    this.cardDeclined.set(false);
    this.cardDeclineReason.set('');
    this.cardTxnRef.set('');
    this.delivery.set(ReceiptDelivery.Print);
    this.searchQ.set('');
    this.sdResults.set([]);
    this.sdNotFound.set(false);
    this.associateSearchQ.set('');
  }

  private openTerminalSimulator(): void {
    this.terminalWaiting.set(true);
    if (!this.terminalWindow || this.terminalWindow.closed) {
      this.terminalWindow = window.open(
        '/terminal-simulator',
        'terminal-simulator',
        'width=420,height=640,menubar=no,toolbar=no,location=no,status=no'
      );
    } else {
      this.terminalWindow.focus();
    }
    setTimeout(() => {
      this.terminalChannel.postMessage({
        type: 'request',
        amount: this.monetary() ?? 0
      });
    }, 500);
  }
}
