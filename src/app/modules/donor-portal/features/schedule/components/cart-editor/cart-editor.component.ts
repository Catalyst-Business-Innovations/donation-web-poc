import { Component, ChangeDetectionStrategy, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { CartItemState, NewCartItemState } from '../../models/schedule.state';

@Component({
  selector: 'app-cart-editor',
  standalone: true,
  imports: [FormsModule, IconComponent],
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

  protected showAdd = signal(false);
  protected newItem: NewCartItemState = { category: '', description: '', qty: 1 };

  addItem(): void {
    if (!this.newItem.category) return;
    this.itemAdded.emit({ ...this.newItem });
    this.newItem = { category: '', description: '', qty: 1 };
    this.showAdd.set(false);
  }
}
