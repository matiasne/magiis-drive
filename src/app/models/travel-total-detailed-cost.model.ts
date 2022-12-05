/**
 * Contains the detail of the travel costs.
 */
export class TravelTotalDetailedCostModel {
  totalCostFinal: number = 0; // Total travel cost.
  totalCostPartial: number = 0;
  waitTimePrice: number = 0;
  tollPrice: number = 0;
  parkingPrice: number = 0;
  otherCostPrice: number = 0;
  totalBaseCharges: number = 0;
  totalBaseDiscounts: number = 0;
  paymentMethodDiscount: number = 0;
  travelDurationCost: number = 0;
  taxiingCost: number = 0;

  constructor() {}
}
