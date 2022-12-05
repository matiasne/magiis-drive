import { RateDetail } from '../rateDetail';
import { PriceUnitEnum } from './price-unit.enum';
import { Additionals } from './Additionals';

export class LongTravelsRule {
    private priceUnit: PriceUnitEnum;
    private discount: number;
    private minDistance: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.priceUnit = <PriceUnitEnum>param.priceUnit;
        this.discount = +param.discount;
        this.minDistance = +param.minDistance;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);
        
        let travelDistance = rateDetail.roundTrip 
        ? (rateDetail.realDistance - rateDetail.realDistanceReturnTrip) 
        : rateDetail.realDistance;

        if (travelDistance > this.minDistance){
            let additional = new Additionals();
            additional.name = "Viajes largos";
            additional.priceUnit = this.priceUnit;
            additional.value = this.discount;
            rateDetail.baseDiscounts.push(additional);
        }

        return rateDetail;
    }

}
