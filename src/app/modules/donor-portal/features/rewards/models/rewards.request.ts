export interface RedeemRewardRequest {
  donorId: number;
  rewardId: number;
}

export interface GiftRewardRequest {
  donorId: number;
  recipientId: number;
  rewardId: number;
}
