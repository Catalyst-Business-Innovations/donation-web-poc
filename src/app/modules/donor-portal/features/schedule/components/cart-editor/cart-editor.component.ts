import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { CartItemState, NewCartItemState } from '../../models/schedule.state';

@Component({
  selector: 'app-cart-editor',
  standalone: true,
  imports: [FormsModule, IconComponent, ModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart-editor.component.html',
  styleUrl: './cart-editor.component.scss',
})
export class CartEditorComponent {
  items = input.required<CartItemState[]>();
  categories = input.required<string[]>();
  totalItems = input.required<number>();
  itemAdded = output<NewCartItemState>();
  itemRemoved = output<string>();

  protected showModal = signal(false);
  protected selectedCategory = signal('');
  protected description = '';
  protected qty = 1;

  openModal(): void {
    this.selectedCategory.set('');
    this.description = '';
    this.qty = 1;
    this.showModal.set(true);
  }

  selectCategory(cat: string): void {
    this.selectedCategory.set(cat);
  }

  addItem(): void {
    const cat = this.selectedCategory();
    if (!cat) return;
    this.itemAdded.emit({ category: cat, description: this.description, qty: this.qty });
    this.showModal.set(false);
  }

  closeModal(): void {
    this.showModal.set(false);
  }
}
