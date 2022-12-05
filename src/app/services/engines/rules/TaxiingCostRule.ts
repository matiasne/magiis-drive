import { RateDetail } from "../rateDetail";
import { Additionals } from "./Additionals";
import { PriceUnitEnum } from "./price-unit.enum";

export class TaxiingCostRule {
  private minRadius: number;
  private taxiingPercent: number; // Porcentaje del valor del km para precio de carreteo
	private includedPercent: number; // Porcentaje de carreteo incluido
	private minCharge: boolean; // True: cargo total - False: paga diferencia
  private includeKmLap: boolean; // True: incluir los km de vuelta a la base desde el destino


  constructor() {}

  private validate(parameters: string) {
    let params = JSON.parse(parameters);
    this.minRadius = +params.minRadius;
    this.taxiingPercent = +params.taxiingPercent;
    this.includedPercent = +params.includedPercent;
    this.minCharge = params.minCharge === 'true';
    this.includeKmLap = params.includeKmLap === 'true';
  }

  public calculate(rateDetail: RateDetail, parameters: string) {
    this.validate(parameters);

    console.log("this.minRadius", this.minRadius);
    console.log("this.taxiingPercent", this.taxiingPercent);
    console.log("this.includedPercent", this.includedPercent);
    console.log("this.minCharge", this.minCharge);
    console.log("this.includeKmLap", this.includeKmLap);

    if (!rateDetail.isRental) {
      const realDistance = rateDetail.realDistance;
      const priceKM = rateDetail.pricePerKM * this.taxiingPercent / 100;
      const taxiingKM = rateDetail.taxiingKM;
      const taxiingLapKM = rateDetail.taxiingLapKM;
      const adjustmentCoeffPercent = 1 + (rateDetail.taxiingAdjustmentCoeff / 100);
      const coeff = (taxiingKM + taxiingLapKM) * adjustmentCoeffPercent;
      let taxiingToPay = 0;

      if((taxiingKM > this.minRadius && taxiingLapKM > this.minRadius) && realDistance < coeff) {
        // Se cobra carreteo
        let kmInclude = realDistance * this.includedPercent / 100;
        let kmIncludeTotal = this.minRadius + kmInclude;
        let taxiingKmToPay = 0;

        if(this.minCharge) {
          // Se cobra el minimo de ambos carreteos (ida o vuelta)
          taxiingKmToPay = taxiingKM <= taxiingLapKM ? taxiingKM : taxiingLapKM;
        } else {
          // Se cobra independiente
          taxiingKmToPay = taxiingKM;
          // Verifico si debe sumar los km de vuelta
          if(this.includeKmLap) taxiingKmToPay = taxiingKmToPay + taxiingLapKM;
        }

        // ((Km carreteo * adjustmentCoeffPercent) - km incluidos) * precio por km de carreteo
        taxiingToPay = ((taxiingKmToPay * adjustmentCoeffPercent) - kmIncludeTotal) * priceKM;
      }

      // Si el costo de carreteo es menor a 0, cobro 0;
      if(taxiingToPay < 0) taxiingToPay = 0;

      let additional = new Additionals();
      additional.name = "Costo de carreteo";
      additional.priceUnit = PriceUnitEnum.MONEY;
      additional.value = taxiingToPay;

      rateDetail.totalDetailedCosts.taxiingCost = taxiingToPay;
      rateDetail.baseCharges.push(additional);
    }

    return rateDetail;
  }
}
