import { Donor, DonorTier } from '../../../../../core/models/domain.models';

export interface DonorEditForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

export class DonorMgmtMapper {
  static tierVariant(t: DonorTier): string {
    const m: Record<DonorTier, string> = {
      [DonorTier.Gold]: 'badge-warning',
      [DonorTier.Silver]: 'badge-gray',
      [DonorTier.Bronze]: 'badge-danger',
      [DonorTier.Platinum]: 'badge-purple',
    };
    return m[t] ?? 'badge-gray';
  }
  static toForm(d: Donor): DonorEditForm {
    return { firstName: d.firstName, lastName: d.lastName, email: d.email, phone: d.phone, address: d.address ?? '' };
  }
  static emptyForm(): DonorEditForm {
    return { firstName: '', lastName: '', email: '', phone: '', address: '' };
  }
}
