import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type IconName =
  | 'plus'
  | 'close'
  | 'edit'
  | 'delete'
  | 'search'
  | 'chevron-down'
  | 'chevron-up'
  | 'checkmark'
  | 'clear'
  | 'copy'
  | 'dollar'
  | 'eye'
  | 'info'
  | 'arrow-right'
  | 'arrow-left'
  | 'refresh'
  | 'users'
  | 'upload'
  | 'alert-circle'
  | 'image'
  | 'grid'
  | 'building'
  | 'map-pin'
  | 'user'
  | 'settings'
  | 'box'
  | 'download'
  | 'check-circle'
  | 'clock'
  | 'x-circle'
  | 'send'
  | 'credit-card'
  | 'file'
  | 'more-vertical'
  | 'home'
  | 'list'
  | 'file-text'
  | 'star'
  | 'calendar'
  | 'package'
  | 'layers'
  | 'trending-up'
  | 'bar-chart'
  | 'gift'
  | 'phone'
  | 'mail'
  | 'printer'
  | 'award'
  | 'sliders'
  | 'bell'
  | 'cart'
  | 'scan';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input<number | string>(16);
  readonly strokeWidth = input<string>('2');

  readonly width = computed(() => this.size().toString());
  readonly height = computed(() => this.size().toString());
}
