import { Injectable, inject, signal, computed } from '@angular/core';
import { MockDataService } from './mock-data.service';
import { Donor } from '../models/domain.models';

@Injectable({ providedIn: 'root' })
export class CurrentDonorService {
  private readonly mockData = inject(MockDataService);

  /**
   * In production, this would be set from the authenticated user's JWT.
   * For now, uses the first donor from MockDataService.
   */
  private readonly _donorId = signal<number>(this.mockData.donors[0]?.id ?? 0);

  readonly donorId = this._donorId.asReadonly();

  readonly donor = computed<Donor>(() => {
    const id = this._donorId();
    return this.mockData.donors.find((d) => d.id === id) ?? this.mockData.donors[0];
  });

  setDonorId(id: number): void {
    this._donorId.set(id);
  }
}
