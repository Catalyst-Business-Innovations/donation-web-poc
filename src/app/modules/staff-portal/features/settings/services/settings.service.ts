import { Injectable, inject } from '@angular/core';
import { MockDataService } from '@core/services/mock-data.service';
import { RewardType } from '@core/models/domain.models';
import {
  SystemRulesState,
  LoyaltyTierState,
  RewardDefinitionState,
  RewardTransactionState,
  RewardFormState
} from '../models/settings.state';
import { RewardFilterStatus } from '../models/settings.enum';
import {
  AppConfigResponse,
  LoyaltyTierResponse,
  RewardDefinitionResponse,
  RewardTransactionResponse
} from '../models/settings.response';
import {
  mapAppConfigToState,
  mapSystemRulesToRequest,
  mapLoyaltyTierToState,
  mapRewardDefinitionToState,
  mapRewardTransactionToState,
  mapRewardFormToCreateRequest,
  mapRewardFormToUpdateRequest
} from '../models/settings.mapper';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly mockData = inject(MockDataService);

  getAppConfig(): SystemRulesState {
    const cfg = this.mockData.appConfig() as AppConfigResponse;
    return mapAppConfigToState(cfg);
  }

  updateAppConfig(state: SystemRulesState): void {
    const request = mapSystemRulesToRequest(state);
    this.mockData.updateAppConfig(request);
  }

  getLoyaltyTiers(): LoyaltyTierState[] {
    const tiers = this.mockData.loyaltyTiers as LoyaltyTierResponse[];
    return tiers.map((t, i) => mapLoyaltyTierToState(t, i));
  }

  updateTierMultiplier(tier: number, multiplier: number): void {
    const found = this.mockData.loyaltyTiers.find(t => t.tier === tier);
    if (found) {
      found.pointsMultiplier = multiplier;
    }
  }

  getRewardDefinitions(statusFilter: RewardFilterStatus, typeFilter: RewardType | 0): RewardDefinitionState[] {
    let list = this.mockData.rewardDefinitions() as RewardDefinitionResponse[];

    if (statusFilter === 'active') list = list.filter(r => r.isActive);
    else if (statusFilter === 'inactive') list = list.filter(r => !r.isActive);

    if (typeFilter) list = list.filter(r => r.rewardType === typeFilter);

    return list.map(mapRewardDefinitionToState);
  }

  createReward(form: RewardFormState): string {
    const request = mapRewardFormToCreateRequest(form);
    const created = this.mockData.addRewardDefinition(request);
    return created.name;
  }

  updateReward(id: number, form: RewardFormState): void {
    const request = mapRewardFormToUpdateRequest(form);
    this.mockData.updateRewardDefinition(id, request);
  }

  deleteReward(id: number): void {
    this.mockData.removeRewardDefinition(id);
  }

  toggleRewardActive(id: number, currentlyActive: boolean): void {
    this.mockData.updateRewardDefinition(id, { isActive: !currentlyActive });
  }

  getRewardTransactions(): RewardTransactionState[] {
    const txns = this.mockData.rewardTransactions() as RewardTransactionResponse[];
    return txns.map(mapRewardTransactionToState);
  }

  approveRedemption(txnId: number): boolean {
    return this.mockData.approveRedemption(txnId);
  }

  rejectRedemption(txnId: number): boolean {
    return this.mockData.rejectRedemption(txnId, 'Rejected by admin');
  }

  fulfillRedemption(txnId: number): boolean {
    return this.mockData.fulfillRedemption(txnId);
  }

  cancelRedemption(txnId: number): boolean {
    return this.mockData.cancelRedemption(txnId);
  }
}
