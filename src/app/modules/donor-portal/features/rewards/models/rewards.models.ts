import { DonorTier } from '../../../../../core/models/domain.models';
import { IconName } from '../../../../../shared/components/icon/icon.component';

export interface RewardItem {
  icon: IconName;
  title: string;
  desc: string;
  cost: number;
}
export interface PointsEntry {
  icon: IconName;
  label: string;
  date: string;
  delta: number;
}
export interface CommunityGift {
  icon: IconName;
  name: string;
  desc: string;
}

export class RewardsMapper {
  static isAchieved(current: DonorTier, check: DonorTier): boolean {
    return check <= current;
  }
}
