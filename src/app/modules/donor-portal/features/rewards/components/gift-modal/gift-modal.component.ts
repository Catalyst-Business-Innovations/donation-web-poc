import { Component, ChangeDetectionStrategy, input, output, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { RewardCatalogueItemState, DonorSearchResultState } from '../../models/rewards.state';
import { GiftStep } from '../../models/rewards.enum';

@Component({
  selector: 'app-gift-modal',
  standalone: true,
  imports: [DecimalPipe, FormsModule, IconComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './gift-modal.component.html',
  styleUrl: './gift-modal.component.scss',
})
export class GiftModalComponent {
  reward = input.required<RewardCatalogueItemState | null>();
  searchResults = input.required<DonorSearchResultState[]>();
  donorPoints = input.required<number>();
  searchQueryChanged = output<string>();
  confirmed = output<number>();
  cancelled = output<void>();

  protected giftStep = signal<GiftStep>('search');
  protected searchQuery = signal('');
  protected selectedRecipient = signal<DonorSearchResultState | null>(null);

  protected readonly modalTitle = computed(() =>
    this.giftStep() === 'search' ? 'Gift a Reward' : 'Confirm Gift'
  );

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchQueryChanged.emit(query);
  }

  selectRecipient(donor: DonorSearchResultState): void {
    this.selectedRecipient.set(donor);
    this.giftStep.set('confirm');
  }

  backToSearch(): void {
    this.giftStep.set('search');
    this.selectedRecipient.set(null);
  }

  onConfirm(): void {
    const recipient = this.selectedRecipient();
    if (recipient) {
      this.confirmed.emit(recipient.id);
    }
  }

  onClose(): void {
    if (this.giftStep() === 'confirm') {
      this.backToSearch();
    } else {
      this.reset();
      this.cancelled.emit();
    }
  }

  reset(): void {
    this.giftStep.set('search');
    this.searchQuery.set('');
    this.selectedRecipient.set(null);
  }
}
