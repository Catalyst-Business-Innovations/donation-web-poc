import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { CurrentUserService } from '@core/services/current-user.service';
import { LocationOptionState } from '../models/schedule.state';
import { mapLocationToOption } from '../models/schedule.mapper';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly mockData = inject(MockDataService);
  private readonly currentUser = inject(CurrentUserService);

  getLocations(): LocationOptionState[] {
    return this.mockData.locations.map(mapLocationToOption);
  }

  getCategoryNames(): string[] {
    return this.mockData.categories.slice(0, 8).map(c => c.name);
  }
}
