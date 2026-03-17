import { Donation } from '../../../../../core/models/domain.models';

export interface YearSummary {
  year: number;
  donations: number;
  items: number;
  value: number;
  points: number;
}

export class HistoryMapper {
  static summarise(donations: Donation[], year: number | null): YearSummary {
    const filtered = year === null ? donations : donations.filter(d => new Date(d.timestamp).getFullYear() === year);
    return {
      year: year ?? 0,
      donations: filtered.length,
      items: filtered.reduce((s, d) => s + d.totalItems, 0),
      value: filtered.reduce((s, d) => s + d.totalEstimatedValue, 0),
      points: filtered.reduce((s, d) => s + (d.loyaltyPointsEarned ?? 0), 0)
    };
  }
}
