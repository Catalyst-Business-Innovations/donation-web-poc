export interface DashboardKpi {
  label: string;
  value: string;
  trend: string;
  trendDown: boolean;
  iconClass: string;
  icon: string;
}

export class AdminDashboardMapper {
  static donutSegments(
    breakdown: { percentage: number; color: string }[]
  ): { color: string; dash: number; gap: number; offset: number }[] {
    const circ = 2 * Math.PI * 50;
    let offset = 0;
    return breakdown.map(cat => {
      const dash = (cat.percentage / 100) * circ;
      const seg = { color: cat.color, dash, gap: circ - dash, offset: -offset };
      offset += dash;
      return seg;
    });
  }
}
