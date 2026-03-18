export interface NotifSetting {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
}
import { IconName } from '../../../../../shared/components/icon/icon.component';
export interface Integration {
  icon: IconName;
  name: string;
  desc: string;
  connected: boolean;
}
export interface OrgSettings {
  orgName: string;
  taxId: string;
  receiptMessage: string;
  irsDisclaimer: string;
}

/** Phase 1 — System Rules settings panel model (Req 2, 3, 4) */
export interface SystemRulesSettings {
  isCashAccepted: boolean;
  associationWindowHours: number;
  pointsPerItem: number;
  emailForReceipt: boolean;
  emailForLogin: boolean;
  emailForCampaigns: boolean;
}
