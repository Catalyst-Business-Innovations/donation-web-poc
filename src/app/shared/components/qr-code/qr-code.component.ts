import { Component, Input, OnChanges, signal } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  template: `
    @if (dataUrl()) {
      <img [src]="dataUrl()" [width]="size" [height]="size" alt="QR Code" style="display: block;" />
    } @else {
      <div [style.width.px]="size" [style.height.px]="size"
           style="background: #f3f3f3; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 11px; color: #999">Loading…</span>
      </div>
    }
  `
})
export class QrCodeComponent implements OnChanges {
  @Input() value = '';
  @Input() size = 160;

  protected dataUrl = signal('');

  ngOnChanges(): void {
    if (!this.value) return;
    QRCode.toDataURL(this.value, {
      width: this.size,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M'
    }).then(url => this.dataUrl.set(url));
  }
}
