export interface CartItem {
  id: string;
  category: string;
  icon: string;
  description: string;
  qty: number;
}
export interface ScheduledVisit {
  id: string;
  date: string;
  day: string;
  month: string;
  location: string;
  time: string;
  items: number;
  recurring?: string;
  notes?: string;
}
export interface NewCartItem {
  category: string;
  description: string;
  qty: number;
}
