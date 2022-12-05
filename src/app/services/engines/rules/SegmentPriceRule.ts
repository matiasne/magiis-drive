import {PriceUnitEnum} from "./price-unit.enum";
import {RateDetail} from "../rateDetail";
import {Additionals} from "./Additionals";


export class SegmentPriceRule {
  private priceUnit: PriceUnitEnum;
  private segmentPriceModifier: number;
  private segmentPriceDistanceTo: number;
  private segmentPriceDistanceFrom: number;
  private applYFullPrice: boolean;

  constructor() { }

  private validate(parameter: string) {
    let param = JSON.parse(parameter);
    this.priceUnit = <PriceUnitEnum>param.priceUnit;
    this.segmentPriceModifier = +param.priceModifier;
    this.segmentPriceDistanceTo = +param.priceSegmentTo;
    this.segmentPriceDistanceFrom = +param.priceSegmentFrom;
    this.applYFullPrice = param.applyFullSegmentPrice ? param.applyFullSegmentPrice: false;
  }

  public calculate(rateDetail: RateDetail, parameter: string) {
    this.validate(parameter);

    if(!rateDetail.isRental){
      let travelDistance = rateDetail.roundTrip
                       ? (rateDetail.realDistance - rateDetail.realDistanceReturnTrip)
                       : rateDetail.realDistance;

      if (travelDistance > this.segmentPriceDistanceFrom && travelDistance <= this.segmentPriceDistanceTo ){
        let discount = this.segmentPriceModifier * -1;
        if(this.applYFullPrice){

          let segmentDistance = this.segmentPriceDistanceTo - rateDetail.minDistance
          rateDetail.fullSegmentDistance = segmentDistance;
          rateDetail.distanceAdjustment.push(segmentDistance * -1);

          let additionalCost = new Additionals();
          additionalCost.name = 'Segmento completo de ' + this.segmentPriceDistanceTo + 'Kms';
          additionalCost.value = (segmentDistance * (100 - discount)) / 100;
          additionalCost.priceUnit =  PriceUnitEnum.KM;
          rateDetail.baseCharges.push(additionalCost);
        }




        let additional = new Additionals();
        additional.name = "Segmento";
        additional.priceUnit = this.priceUnit;
        additional.value = -1 * this.segmentPriceModifier;
        rateDetail.baseDiscounts.push(additional);
      }
    }
    return rateDetail;
  }
}
