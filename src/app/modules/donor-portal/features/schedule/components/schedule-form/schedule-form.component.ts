import { Component, ChangeDetectionStrategy, input, output, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '@shared/components/icon/icon.component';
import { LocationOptionState } from '../../models/schedule.state';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [FormsModule, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule-form.component.html',
  styleUrl: './schedule-form.component.scss'
})
export class ScheduleFormComponent {
  locations = input.required<LocationOptionState[]>();
  timeSlots = input.required<string[]>();
  today = input.required<string>();

  selectedLocation = model<number | null>(null);
  selectedDate = model('');
  selectedTime = model('');
  notes = model('');

  submitRequested = output<void>();

  get selectedLocationDetail(): LocationOptionState | undefined {
    return this.locations().find(l => l.id === this.selectedLocation());
  }
}
