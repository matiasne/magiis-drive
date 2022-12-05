import { OneShotRulesModel } from './one-shot-rules.model';
import { TravelRateRuleModel } from './travel-rate-rule.model';

export class TravelAffiliateSettingsModel {
  type: 'ONE_SHOT' | 'ATC';
  oneShotRules?: OneShotRulesModel;
  atcRules?: Array<TravelRateRuleModel>;
  pricePerKm: number;
  constructor() {}
}

