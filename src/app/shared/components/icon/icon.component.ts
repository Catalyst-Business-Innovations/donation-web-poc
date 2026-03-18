import { Component, Input } from '@angular/core';
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
  | 'cart';

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrls: ['./icon.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class IconComponent {
  @Input() name!: IconName;
  @Input() width: string = '16';
  @Input() height: string = '16';
  @Input() strokeWidth: string = '2';
  @Input() class: string = '';

  @Input() set size(value: number | string) {
    const sizeStr = value.toString();
    this.width = sizeStr;
    this.height = sizeStr;
  }
}
