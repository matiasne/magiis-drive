import { RateDetail } from '../rateDetail';
import { Additionals } from './Additionals';
import { PriceUnitEnum } from './price-unit.enum';

export class AdditionalStopRule {
    private stopPrice: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.stopPrice = +param.stopPrice;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);

        if (rateDetail.isRental) {
            return rateDetail;
        }

        if (rateDetail.additionalStops != null && rateDetail.additionalStops > 0){
            let km = rateDetail.additionalStops * this.stopPrice;
            let additional = new Additionals();
            additional.name = "Paradas adicionales";
            additional.priceUnit = PriceUnitEnum.KM;
            additional.value = km;

            rateDetail.baseCharges.push(additional);
        }

        return rateDetail;
    }

}