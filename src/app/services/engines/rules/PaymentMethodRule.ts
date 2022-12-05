import { RateDetail } from '../rateDetail';
import { PaymentMethodValueEnum } from '../../enum/paymentMethod';
import { Additionals } from './Additionals';
import { PriceUnitEnum } from './price-unit.enum';

export class PaymentMethodRule {
    private paymentMethod: PaymentMethodValueEnum;
    private discount: number;

    constructor() { }

    private validate(parameter: string){
        let param = JSON.parse(parameter);
        this.discount = +param.discount;
        this.paymentMethod = param.paymentMethod;
    }

    public calculate(rateDetail: RateDetail, parameter: string) {
        this.validate(parameter);


        if (rateDetail.paymentMethod == this.paymentMethod){
            let additional = new Additionals();
            additional.name = "Medio de pago";
            additional.priceUnit = PriceUnitEnum.PERCENTAGE;
            additional.value = this.discount;

            rateDetail.totalDetailedCosts.paymentMethodDiscount = this.discount;
            rateDetail.discountsOnTotal.push(additional);
        }

        return rateDetail;
    }

}
