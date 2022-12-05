import {PaymentMethodValueEnum} from "../enum/paymentMethod";
import {Additionals} from "./rules/Additionals";
import {PriceUnitEnum} from "./rules/price-unit.enum";
import { TravelTotalDetailedCostModel } from '../../models/travel-total-detailed-cost.model';
import {RentTypeEnum} from "../enum/rent-type.enum";

export class RateDetail {
    pricePerKM: number;
    pricePerKMAcum: number;
    realDistance: number;
    realDistanceReturnTrip: number;
    simulatedDistance: number;
    simulatedDistanceReturnTrip: number;
    additionalStops: number;
    waitTime: number;
    paymentMethod: PaymentMethodValueEnum;
    roundTrip: boolean;
    minDistance: number;
    minCostDistance: number
    endTravelTolerance: number;
    fullSegmentDistance: number;
    isRental: boolean;
    rentHours: number;
    rentType: RentTypeEnum;
    duration: number;
    taxiingKM: number;
    taxiingLapKM: number;
    taxiingAdjustmentCoeff: number;

    totalDetailedCosts: TravelTotalDetailedCostModel = new TravelTotalDetailedCostModel;

    distanceAdjustment: Array<number>;
    baseCharges: Array<Additionals>;
    baseDiscounts: Array<Additionals>;
    chargesOnTotal: Array<Additionals>;
    discountsOnTotal: Array<Additionals>;

    constructor() {
        this.distanceAdjustment = new Array<number>();
        this.baseCharges = new Array<Additionals>();
        this.baseDiscounts = new Array<Additionals>();
        this.chargesOnTotal = new Array<Additionals>();
        this.discountsOnTotal = new Array<Additionals>();
     }

     private subTotal(){
        console.log("Precio del KM: $"+this.pricePerKM);
        let distance = this.realDistance;
        console.log("Distancia real: "+this.realDistance+"Km");

        if (this.distanceAdjustment.length > 0){
            this.distanceAdjustment.forEach(element => {
                distance = Number(distance) + Number(element);
                console.log("Ajuste de distancia: "+element+"Km");
            });
        }

        if (distance < 0){
            distance = 0;
        }

        console.log("Distancia a cobrar: "+distance+"Km");

         let baseCost = distance * this.pricePerKM;
         let subTotal = baseCost;

       //Apply additional base charges
       if (this.baseCharges.length > 0){
         this.baseCharges.forEach(element => {
           this.updatePricePerKmAcum(element, true);
           console.log("baseCharges - PricePerKMAcum: " + this.pricePerKMAcum);
         });
       }

       //Apply additional base discounts
       if (this.baseDiscounts.length > 0){
         console.log("Descuentos (sobre el costo base):");
         this.baseDiscounts.forEach(element => {
           this.updatePricePerKmAcum(element, false);
           console.log("baseDiscounts - PricePerKMAcum: " + this.pricePerKMAcum);
         });
       }

        //Apply additional base charges
        if (this.baseCharges.length > 0){
            console.log("Cargos adicionales (sobre el costo base):");
            this.baseCharges.forEach(element => {
                this.totalDetailedCosts.totalBaseCharges = Number(this.totalDetailedCosts.totalBaseCharges) + Number(this.getAdditionalCost(element, baseCost));
                subTotal = Number(subTotal) + Number(this.getAdditionalCost(element, baseCost));
                console.log("subtotal1: "+ subTotal);
            });
        }

        //Apply additional base discounts
        if (this.baseDiscounts.length > 0){
            console.log("Descuentos (sobre el costo base):");
            this.baseDiscounts.forEach(element => {
                this.totalDetailedCosts.totalBaseDiscounts = Number(this.totalDetailedCosts.totalBaseDiscounts) + Number(this.getAdditionalCost(element, baseCost));
                subTotal = Number(subTotal) - Number(this.getAdditionalCost(element, baseCost));
                console.log("subtotal2: "+ subTotal);
            });
        }

       console.log("SUBTOTAL: $"+subTotal);
        return subTotal;
     }

     public totalCost(){
         let subTotal = Number(this.subTotal());
         let total = Number(subTotal);

         if(this.chargesOnTotal.length > 0){
            //console.log("Cargos adicionales (sobre el subtotal):");
            this.chargesOnTotal.forEach(element => {
                total = Number(total) + Number(this.getAdditionalCost(element, subTotal));
                //console.log("  *"+element.name+": $"+this.getAdditionalCost(element, subTotal));
            });
         }

         if(this.discountsOnTotal.length > 0){
            //console.log("Descuentos (sobre el subtotal):");
             this.discountsOnTotal.forEach(elemnt => {
                total = Number(total) - Number(this.getAdditionalCost(elemnt, subTotal));
                //console.log("  *"+elemnt.name+": $"+this.getAdditionalCost(elemnt, subTotal));
             });
         }

         console.log("--------------");
         console.log("TOTAL: $"+Math.round(total));
         return Math.round(total);
     }

     private getAdditionalCost(additional: Additionals, baseCost: number){
         let charge: number = 0;
         console.log("getAdditionalCost - baseCost: " + baseCost);
         console.log("getAdditionalCost - pricePerKMAcum: " + this.pricePerKMAcum);
         console.log("getAdditionalCost - pricePerKM: " + this.pricePerKM);
         console.log("getAdditionalCost - additionals: ");
         console.log(additional);
         switch (additional.priceUnit) {
            case PriceUnitEnum.KM:
                charge = Number(additional.value) * Number(this.pricePerKM);
                break;

            case PriceUnitEnum.PERCENTAGE:
                charge = Number(baseCost) * (Number(additional.value) / 100);
                break;

            case PriceUnitEnum.MONEY:
                charge = Number(additional.value);
                break;

           case PriceUnitEnum.DISTANCE_PERCENTEGE:
                charge = additional.value * this.pricePerKMAcum;
                break;
         }

         return charge;
     }

     private updatePricePerKmAcum(additional: Additionals, addition: boolean){
        if(additional.priceUnit === PriceUnitEnum.PERCENTAGE){
               const segmentDistancePrice = this.pricePerKMAcum * additional.value / 100;
               this.pricePerKMAcum = addition ? this.pricePerKMAcum + segmentDistancePrice : this.pricePerKMAcum - segmentDistancePrice;
        }
     }

    public getOneWayDistance() {
		return this.realDistance - this.realDistanceReturnTrip;
	}
}
