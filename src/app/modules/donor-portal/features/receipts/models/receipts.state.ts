export interface ReceiptListItemState {
  id: number;
  receiptNumber: string;
  timestamp: Date;
  locationName: string;
  totalItems: number;
}

export interface ReceiptDetailState {
  receiptNumber: string;
  timestamp: Date;
  locationName: string;
  totalItems: number;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
}
