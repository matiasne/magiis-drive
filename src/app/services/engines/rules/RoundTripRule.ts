import {PriceUnitEnum} from "./price-unit.enum";
import {RateDetail} from "../rateDetail";
import {Additionals} from "./Additionals";


export class RoundTripRule {
  private discount: number;

  constructor() { }

  private validate(parameter: string) {
    let param = JSON.parse(parameter);
    this.discount = +param.discount;
  }

  public calculate(rateDetail: RateDetail, parameter: string) {
    this.validate(parameter);
    if(!rateDetail.isRental){
      let realDistanceReturnTrip = rateDetail.realDistanceReturnTrip;
      let minDistance = rateDetail.minDistance;
      let oneWayDistance = rateDetail.getOneWayDistance();
      //console.log("oneWayDistance: " + oneWayDistance);

      if (rateDetail.roundTrip) {
        let realMinCost = rateDetail.minCostDistance ? rateDetail.minCostDistance : rateDetail.minDistance;

        if (oneWayDistance > minDistance && rateDetail.fullSegmentDistance == null) {
          let additional = new Additionals();
          additional.name = "Viaje Ida y Vuelta";
          additional.priceUnit = PriceUnitEnum.DISTANCE_PERCENTEGE;
          additional.value = (realDistanceReturnTrip * this.discount / 100);
          rateDetail.baseDiscounts.push(additional);
        } else if (rateDetail.fullSegmentDistance!= null) {
          this.addSegmentReturnPrice(rateDetail, rateDetail.fullSegmentDistance, PriceUnitEnum.DISTANCE_PERCENTEGE);
          this.addSegmentReturnPrice(rateDetail, realMinCost, PriceUnitEnum.KM);
          this.substractReturnDistance(rateDetail, realDistanceReturnTrip);
        } else {
          this.addSegmentReturnPrice(rateDetail, realMinCost, PriceUnitEnum.KM);
          this.substractReturnDistance(rateDetail, realDistanceReturnTrip);
        }
      }
    }
    return rateDetail;
  }

  private addSegmentReturnPrice(rateDetail: RateDetail, segmentDistance: number, priceUnit: PriceUnitEnum){
      let discountValue = 100 - this.discount;
      let distanceDiscount = segmentDistance * discountValue / 100;

      let additional = new Additionals();
      additional.name = "Viaje Ida y Vuelta"
      additional.priceUnit = priceUnit;
      additional.value = distanceDiscount;
      rateDetail.baseCharges.push(additional);
  }

  private substractReturnDistance(rateDetail: RateDetail, travelDistanceReturnTrip: number){
    rateDetail.distanceAdjustment.push(travelDistanceReturnTrip * -1);
  }
}

