export interface RedeemRewardResponse {
  transactionId: number;
  rewardName: string;
  pointsUsed: number;
  voucherCode?: string;
}

export interface GiftRewardResponse {
  transactionId: number;
  rewardName: string;
  recipientName: string;
  pointsUsed: number;
}
