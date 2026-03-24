import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { QrCodeComponent } from '@shared/components/qr-code/qr-code.component';
import { ScheduledVisitState } from '../../models/schedule.state';

@Component({
  selector: 'app-visit-detail-modal',
  standalone: true,
  imports: [DatePipe, IconComponent, ModalComponent, QrCodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visit-detail-modal.component.html',
  styleUrl: './visit-detail-modal.component.scss',
})
export class VisitDetailModalComponent {
  visit = input.required<ScheduledVisitState | null>();
  closed = output<void>();
}
