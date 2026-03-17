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
