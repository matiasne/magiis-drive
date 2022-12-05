import {RateDetail} from "../rateDetail";
import {Additionals} from "./Additionals";
import {PriceUnitEnum} from "./price-unit.enum";

export class TravelTimeRule {
  private pricePerMinPercentage: number;

  constructor() { }

  private validate(parameter: string){
    let param = JSON.parse(parameter);
    this.pricePerMinPercentage = param.pricePerMin;
  }

  public calculate(rateDetail: RateDetail, parameter: string) {
    this.validate(parameter);

    if(!rateDetail.isRental && rateDetail.duration > 0){
      const travelDuration = rateDetail.duration - rateDetail.waitTime;
      const pricePerKM = rateDetail.pricePerKM;
      const pricerPerMin = pricePerKM * this.pricePerMinPercentage / 100;
      const travelDurationCost = travelDuration * pricerPerMin;

      let additional = new Additionals();
      additional.name = "Tiempo del viaje";
      additional.priceUnit = PriceUnitEnum.MONEY;
      additional.value = travelDurationCost;

      rateDetail.totalDetailedCosts.travelDurationCost = travelDurationCost;
      rateDetail.baseCharges.push(additional);
    }

    return rateDetail;
  }

}
