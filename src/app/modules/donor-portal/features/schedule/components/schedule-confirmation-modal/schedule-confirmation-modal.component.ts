import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { IconComponent } from '@shared/components/icon/icon.component';
import { ModalComponent } from '@shared/components/modal/modal.component';
import { QrCodeComponent } from '@shared/components/qr-code/qr-code.component';
import { ConfirmationState } from '../../models/schedule.state';

@Component({
  selector: 'app-schedule-confirmation-modal',
  standalone: true,
  imports: [DatePipe, IconComponent, ModalComponent, QrCodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-confirmation-modal.component.html',
  styleUrl: './schedule-confirmation-modal.component.scss',
})
export class ScheduleConfirmationModalComponent {
  open = input.required<boolean>();
  confirmation = input.required<ConfirmationState>();
  closed = output<void>();
}
