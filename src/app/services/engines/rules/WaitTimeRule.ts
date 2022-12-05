import { RateDetail } from '../rateDetail';
import { PriceUnitEnum } from './price-unit.enum';
import { Additionals } from './Additionals';

export class WaitTimeRule {
    private priceUnit: string;
    private pricePerHour: number;
    private tolerance: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.priceUnit = param.priceUnit;
        this.pricePerHour = +param.pricePerHour;
        this.tolerance = +param.tolerance;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);

        if(!rateDetail.isRental){
          if (rateDetail.waitTime != null && rateDetail.waitTime > 0){
              if (rateDetail.waitTime > this.tolerance){

                  let priceKM: number;
                  if (this.priceUnit == PriceUnitEnum.MONEY){
                      priceKM = this.pricePerHour;
                  }else{
                      priceKM = rateDetail.pricePerKM * this.pricePerHour;
                  }

                  let additionalTime = rateDetail.waitTime - this.tolerance;
                  let waitCost = additionalTime * priceKM / 60;

                  let additional = new Additionals();
                  additional.name = "Tiempo de espera";
                  additional.priceUnit = PriceUnitEnum.MONEY;
                  additional.value = waitCost;

                  rateDetail.totalDetailedCosts.waitTimePrice = waitCost;
                  rateDetail.baseCharges.push(additional);

              }
          }
        }

        return rateDetail;
    }
}
