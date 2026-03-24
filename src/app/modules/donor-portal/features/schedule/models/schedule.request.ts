export interface ScheduleDonationRequest {
  locationId: number;
  date: string;
  time: string;
  notes: string;
  recurring: string;
  cartItems: ScheduleCartItemRequest[];
}

export interface ScheduleCartItemRequest {
  category: string;
  description: string;
  qty: number;
}
