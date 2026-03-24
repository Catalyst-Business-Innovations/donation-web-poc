import { Location, LocationStatus, LocationStatusLabel } from '@core/models/domain.models';
import { LocationOptionState } from './schedule.state';

export const mapLocationToOption = (loc: Location): LocationOptionState => ({
  id: loc.id,
  name: loc.name,
  address: loc.address,
  hours: loc.hours,
  statusLabel: LocationStatusLabel[loc.status],
  statusBadgeClass: loc.status === LocationStatus.Open ? 'badge-success' : 'badge-warning',
  isClosed: loc.status === LocationStatus.Closed
});
