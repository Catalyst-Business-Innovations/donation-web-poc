import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import QRCode from 'qrcode';

@Component({
  selector: 'app-qr-code',
  standalone: true,
  templateUrl: './qr-code.component.html',
  styleUrl: './qr-code.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QrCodeComponent {
  readonly value = input('');
  readonly size = input(160);

  protected dataUrl = signal('');
  protected errorMessage = signal('');

  constructor() {
    effect(() => {
      const val = this.value();
      const sz = this.size();
      if (!val) {
        this.dataUrl.set('');
        return;
      }
      this.errorMessage.set('');
      QRCode.toDataURL(val, {
        width: sz,
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
        errorCorrectionLevel: 'M'
      })
        .then((url) => this.dataUrl.set(url))
        .catch(() => {
          this.dataUrl.set('');
          this.errorMessage.set('Failed to generate QR code');
        });
    });
  }
}
