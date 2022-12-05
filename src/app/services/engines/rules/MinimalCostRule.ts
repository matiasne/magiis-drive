import { RateDetail } from '../rateDetail';
import { Additionals } from './Additionals';
import { PriceUnitEnum } from './price-unit.enum';

export class MinimalCostRule {
    private minDistance: number;
    private minCost: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.minDistance = +param.minDistance;
        this.minCost = param.minCost ? +param.minCost : this.minDistance;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);
        if(!rateDetail.isRental){
          rateDetail.minDistance = this.minDistance;
          rateDetail.minCostDistance = this.minCost;
          let distanceAdjustment = this.minDistance * -1;
          rateDetail.distanceAdjustment.push(distanceAdjustment);

          let additional = new Additionals();
          additional.name = "Costo minimo";
          additional.priceUnit = PriceUnitEnum.KM;
          additional.value = this.minCost;
          rateDetail.baseCharges.push(additional);
        }

        return rateDetail;
    }

}
