import { Injectable } from '@angular/core';
import { TravelRateRuleModel } from '../../models/travel-rate-rule.model';
import { RateDetail } from './rateDetail';
import { RuleTypeEnum } from './rules/rule-type.enum';
import { MinTravelRule } from './rules/MinTravelRule';
import { AdditionalStopRule } from './rules/AdditionalStopRule';
import { WaitTimeRule } from './rules/WaitTimeRule';
import { LongTravelsRule } from './rules/LongTravelsRule';
import { PaymentMethodValueEnum } from '../enum/paymentMethod';
import { PaymentMethodRule } from './rules/PaymentMethodRule';
import { MinimalCostRule } from './rules/MinimalCostRule';
import { Additionals } from './rules/Additionals';
import { PriceUnitEnum } from './rules/price-unit.enum';
import { RoundTripRule } from './rules/RoundTripRule';
import {SegmentPriceRule} from "./rules/SegmentPriceRule";
import { TravelTotalDetailedCostModel } from '../../models/travel-total-detailed-cost.model';
import {RentalCarRule} from "./rules/RentalCarRule";
import {RentTypeEnum} from "../enum/rent-type.enum";
import {TravelTimeRule} from "./rules/TravelTimeRule";
import { TaxiingCostRule } from './rules/TaxiingCostRule';
import { OneShotRulesModel } from '../../models/one-shot-rules.model';

@Injectable({providedIn:'root'})
export class RateEngineService {

    constructor() { }

    public getBaseCosts(distance: number, distanceReturnTrip: number, pricePerKM: number, additionalStop: number, waitTime: number,
                        paymentMethod: PaymentMethodValueEnum, simulatedDistance: number, simulatedDistanceReturnTrip: number, roundTrip: boolean, endTravelTolerance: number,
                        isRental: boolean, rentHours: number, rentType: RentTypeEnum, duration:number, taxiingDistance: number, lapDistance: number, taxiingAdjustmentCoeff: number,
                        rules?: Array<TravelRateRuleModel>) {
        let rateDetail = new RateDetail();
        rateDetail.pricePerKM = pricePerKM;
        rateDetail.pricePerKMAcum = pricePerKM;
        rateDetail.realDistance = distance;
        rateDetail.realDistanceReturnTrip = distanceReturnTrip;
        rateDetail.additionalStops = additionalStop;
        rateDetail.waitTime = waitTime;
        rateDetail.paymentMethod = paymentMethod;
        rateDetail.simulatedDistance = simulatedDistance;
        rateDetail.simulatedDistanceReturnTrip = simulatedDistanceReturnTrip;
        rateDetail.roundTrip = roundTrip;
        rateDetail.endTravelTolerance = endTravelTolerance;
        rateDetail.isRental = isRental,
        rateDetail.rentHours = rentHours,
        rateDetail.rentType = rentType,
        rateDetail.duration = duration;
        rateDetail.taxiingKM = taxiingDistance;
        rateDetail.taxiingLapKM = lapDistance;
        rateDetail.taxiingAdjustmentCoeff = taxiingAdjustmentCoeff;
        if (rules){
            rules.forEach(element => {
               rateDetail = this.processRule(element, rateDetail);
            });
        }
        console.log("retailDetail despues de ejecutar todas las reglas");
        console.log(rateDetail);
        return rateDetail;
    }

    private processRule(rule: TravelRateRuleModel, rateDetail: RateDetail){
        let result: RateDetail;

        switch (rule.clazz) {
            case RuleTypeEnum.MinTravel:
                result = new MinTravelRule().calculate(rateDetail,rule.parameter);
                break;

            case RuleTypeEnum.AdditionalStop:
                result = new AdditionalStopRule().calculate(rateDetail,rule.parameter);
                break;

            case RuleTypeEnum.WaitTime:
                result = new WaitTimeRule().calculate(rateDetail, rule.parameter);
                break;

            case RuleTypeEnum.LongTravel:
                result = new LongTravelsRule().calculate(rateDetail, rule.parameter);
                break;

            case RuleTypeEnum.PaymentMethodDiscount:
                result = new PaymentMethodRule().calculate(rateDetail, rule.parameter);
                break;

            case RuleTypeEnum.MinimalCost:
                result = new MinimalCostRule().calculate(rateDetail, rule.parameter);
                break;

            case RuleTypeEnum.SegmentPrice:
                result = new SegmentPriceRule().calculate(rateDetail, rule.parameter);
                break;

            case RuleTypeEnum.RoundTrip:
                result = new RoundTripRule().calculate(rateDetail, rule.parameter);
                break;
            case RuleTypeEnum.RentalCarRule:
                result = new RentalCarRule().calculate(rateDetail, rule.parameter);
                break;

          case RuleTypeEnum.TravelTimeRule:
                result = new TravelTimeRule().calculate(rateDetail, rule.parameter);
                break;

          case RuleTypeEnum.TaxiingCostRule:
                result = new TaxiingCostRule().calculate(rateDetail, rule.parameter);
                break;

            default:
                result = rateDetail;
                break;
        }

        return result;
    }

    public calculateTravelCost(
      distance: number, distanceReturnTrip: number, pricePerKM: number, tollPrice: number, parking: number,
      otherCost: number, additionalStop: number, waitTime: number, paymentMethod: PaymentMethodValueEnum,
      roundTrip: boolean, simulatedDistance: number, simulatedDistanceReturnTrip: number, endTravelTolerance: number,
      isRental: boolean, rentalHours: number, rentType: RentTypeEnum, duration: number, taxiingDistance: number, lapDistance: number, taxiingAdjustmentCoeff: number,
      rules?: Array<TravelRateRuleModel>
    ): TravelTotalDetailedCostModel {
        let rateDetail = this.getBaseCosts(+distance, +distanceReturnTrip, +pricePerKM, +additionalStop, +waitTime, paymentMethod,
          simulatedDistance, simulatedDistanceReturnTrip, roundTrip, endTravelTolerance,
          isRental, rentalHours, rentType, duration, taxiingDistance, lapDistance, taxiingAdjustmentCoeff, rules);

        if (tollPrice != null && tollPrice > 0){
            let toll = new Additionals();
            toll.name = "Peajes";
            toll.priceUnit = PriceUnitEnum.MONEY;
            toll.value = tollPrice;

            rateDetail.totalDetailedCosts.tollPrice = tollPrice;
            rateDetail.baseCharges.push(toll);

        }

        if (parking != null && parking > 0){
            let pk = new Additionals();
            pk.name = "Estacionamiento";
            pk.priceUnit = PriceUnitEnum.MONEY;
            pk.value = parking;

            rateDetail.totalDetailedCosts.parkingPrice = parking;
            rateDetail.baseCharges.push(pk);
        }

        if (otherCost != null){
          let pk = new Additionals();
          pk.name = "Otros costos";
          pk.priceUnit = PriceUnitEnum.MONEY;
          pk.value = otherCost;

          rateDetail.totalDetailedCosts.otherCostPrice = otherCost;
          if(pk.value >= 0) rateDetail.baseCharges.push(pk);
          else {
            pk.value *= -1;
            rateDetail.baseDiscounts.push(pk);
          }
      }

        rateDetail.totalDetailedCosts.totalCostFinal = rateDetail.totalCost();

        return rateDetail.totalDetailedCosts;
    }

    public calculateWaitTimeCost(waitTime: number, pricePerKm: number, rules?: Array<TravelRateRuleModel>): number {
      let waitTimeCost: number = 0;
      if (rules) {
        rules.forEach(rule => {
          if(rule.clazz === RuleTypeEnum.WaitTime) {
            let rateDetail: RateDetail = new RateDetail();
            rateDetail.pricePerKM = pricePerKm;
            rateDetail.waitTime = waitTime;
            rateDetail = new WaitTimeRule().calculate(rateDetail, rule.parameter);

            rateDetail.baseCharges.forEach(charge => {
              if(charge.name === "Tiempo de espera") {
                waitTimeCost = charge.value;
              }
            });
          }
        });
      }

      return waitTimeCost;
    }

    public calculateOneShotTravelCost(finalDistance:number, priceToll:number, priceParking:number,
      priceOtherCost: number, additionalStops: number, waitMinutes: number, originDistance: number,
      oneShotRules: OneShotRulesModel): TravelTotalDetailedCostModel{

        console.info("One-Shot: Entro al calculo One-Shot");
        let rateDetail: TravelTotalDetailedCostModel = new TravelTotalDetailedCostModel();
        rateDetail.totalCostPartial = oneShotRules.travelCostWithMarkup + Math.round(finalDistance-originDistance) * oneShotRules.extraKmValue;

        //Sumo adicionales
        console.info("One-Shot: Sumo adicionales");
        rateDetail.parkingPrice = (oneShotRules.includeParking ? 0 : priceParking);
        rateDetail.tollPrice = (oneShotRules.includeToll ? 0 : priceToll);
        rateDetail.waitTimePrice = ((oneShotRules.includedWaitTime < waitMinutes) ?
                                       ((waitMinutes - oneShotRules.includedWaitTime) * oneShotRules.extraWaitTimeValue) : 0);
        rateDetail.otherCostPrice = (oneShotRules.includeOther ? 0 : priceOtherCost);
        rateDetail.totalCostFinal = (rateDetail.totalCostPartial + rateDetail.parkingPrice + rateDetail.tollPrice + rateDetail.waitTimePrice + rateDetail.otherCostPrice);
        console.info("Fin calculo oneShot", rateDetail);
        return rateDetail;
    }

}
