export interface HourlyPoint {
  label: string;
  count: number;
  current: boolean;
}
export interface CategoryStat {
  key: string;
  name: string;
  icon: string;
  count: number;
  pct: number;
  colorClass: string;
}

export class ReportsMapper {
  static defaultHourly(): HourlyPoint[] {
    return [
      { label: '9am', count: 2, current: false },
      { label: '10am', count: 4, current: false },
      { label: '11am', count: 6, current: false },
      { label: '12pm', count: 8, current: false },
      { label: '1pm', count: 5, current: false },
      { label: '2pm', count: 7, current: false },
      { label: '3pm', count: 4, current: true },
      { label: '4pm', count: 0, current: false },
      { label: '5pm', count: 0, current: false }
    ];
  }
  static maxHourly(h: HourlyPoint[]): number {
    return Math.max(...h.map(i => i.count), 1);
  }
}
