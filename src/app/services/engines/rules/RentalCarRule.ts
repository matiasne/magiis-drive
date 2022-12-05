import {RateDetail} from "../rateDetail";
import {Additionals} from "./Additionals";
import {PriceUnitEnum} from "./price-unit.enum";
import {RentTypeEnum} from "../../enum/rent-type.enum";


export class RentalCarRule {
  private pricerPerHour: number;
  private kmsIncluded: number;
  private kmsIncludedPerHour;

  constructor() {  }

  private validate(parameter: string){
    let param = JSON.parse(parameter);
    this.pricerPerHour = +param.pricePerHour;
    this.kmsIncluded = +param.kmsIncluded;
    this.kmsIncludedPerHour = +param.kmsIncludedPerHour;
  }

  public calculate(rateDetail: RateDetail, parameter: string) {
    this.validate(parameter);


    if(!rateDetail.isRental){
      return rateDetail;
    }

    const rentHours = this.getRentHours(rateDetail);

    rateDetail.baseCharges.push(this.calculateHourCost(rentHours));
    rateDetail.distanceAdjustment.push(this.calculateKmsCost(rateDetail, rentHours));

    return rateDetail;
  }

  private calculateKmsCost(rateDetail: RateDetail, rentHours: number): number {
    let freeKms: number = 0;
    switch (rateDetail.rentType) {
      case RentTypeEnum.KMS_ILLIMITED:
        freeKms = rateDetail.realDistance;
        break;
      case RentTypeEnum.KMS_INCLUDED:
        freeKms = this.kmsIncluded;
        break;
      case RentTypeEnum.KMS_INCLUDED_PER_HOUR:
        freeKms = rentHours * this.kmsIncludedPerHour;
        break;
      default:
        break;
    }

    let kmsToPay = 0;
    if(rateDetail.realDistance >= freeKms){
      kmsToPay = rateDetail.realDistance - freeKms;
    }

    return (rateDetail.realDistance - kmsToPay) * -1;
  }

  private calculateHourCost(rentHours: number): Additionals {
    const cost = rentHours * this.pricerPerHour;
    const additional = new Additionals();
    additional.name = 'Rental Car: Hour Cost';
    additional.value =  cost;
    additional.priceUnit = PriceUnitEnum.KM;
    return additional;
  }

  private getRentHours(rateDetail: RateDetail): number{
    const rentalHoursSimulated = rateDetail.rentHours;
    const totalRentalHours = Math.ceil(rateDetail.duration/ 60);
    return rentalHoursSimulated > totalRentalHours ? rentalHoursSimulated : totalRentalHours;
  }
}
