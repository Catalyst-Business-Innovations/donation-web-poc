export interface CartItemState {
  id: string;
  category: string;
  description: string;
  qty: number;
}

export interface NewCartItemState {
  category: string;
  description: string;
  qty: number;
}

export interface LocationOptionState {
  id: number;
  name: string;
  address: string;
  hours: string;
  statusLabel: string;
  statusBadgeClass: string;
  isClosed: boolean;
}

export interface ScheduledVisitState {
  referenceNumber: string;
  date: string;
  day: string;
  month: string;
  location: string;
  time: string;
  items: number;
  recurring?: string;
  notes?: string;
}

export interface ConfirmationState {
  id: string;
  location: string;
  date: string;
  time: string;
  recurring: string;
  items: number;
}
