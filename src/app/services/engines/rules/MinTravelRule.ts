import { RateDetail } from '../rateDetail';
import { Additionals } from './Additionals';
import { PriceUnitEnum } from './price-unit.enum';

export class MinTravelRule {
    private minDistance: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.minDistance = +param.minDistance;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);
        rateDetail.minDistance = this.minDistance;
        if(rateDetail.realDistance < this.minDistance && !rateDetail.isRental){
            let distanceAdjustment = this.minDistance - rateDetail.realDistance;

            let additional = new Additionals();
            additional.name = "Distancia minima";
            additional.priceUnit = PriceUnitEnum.KM;
            additional.value = distanceAdjustment;
            rateDetail.minDistance = this.minDistance;
            rateDetail.baseCharges.push(additional);
        }

        return rateDetail;
    }

}
