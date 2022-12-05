import { PlaceModel } from './../../../models/place.model';
import { IRequestCommand } from '../iRequestCommand';
import { CommandRequestType } from '../commandRequestType';
import { ICommandParameters } from '../iCommandParameters';
import { ICommandResponse } from '../iCommandResponse';
import { ErrorDetails } from '../interfaces/apiInterfaces';
import { PaymentMethodValueEnum } from "../../enum/paymentMethod";
import { WaitDetailItemModel } from '../../../models/wait-detail-item.model';
import { TollDetailItemModel } from '../../../models/toll-detail-item.model';
import { ParkingDetailItemModel } from '../../../models/parking-detail-item.model';
import { OtherCostDetailItemModel } from '../../../models/other-cost-detail-item.model';
import { TravelAuditModel } from '../../../models/travel-audit.model';

export class PayTravelCommand extends IRequestCommand<IPayTravelResponse, ErrorDetails, IPayTravelCommandParameters> {
    _commandType: CommandRequestType = CommandRequestType.POST;
    _commandUrl = 'carriers/{carrierUserId}/travels/{travelId}/finalize';
    public setParameters(parameters: IPayTravelCommandParameters) {
        this._commandUrl = this._commandUrl.replace('{travelId}', parameters.travelId.toString());
        this._commandUrl = this._commandUrl.replace('{carrierUserId}', parameters.carrierUserId.toString());
        this._commandBody = parameters;
    };
}

export interface IPayTravelCommandParameters extends ICommandParameters {
    paymentMethod: PaymentMethodValueEnum;
    travelId: number;           // TravelID.
    carrierUserId: number;      // CarrierID.
    finalKm: number;            // Travel distance.
    finalCost: number;          // Total trip cost.
    transferCost?: number; // Transfer cost for affiliate
    totalTransferCost?: number; // Transfer cost for affiliate with extras
    totalCostPartial: number;   // Cost of the trip without surcharges.
    wayPoints: string;          // WayPoints.
    destination: PlaceModel;    // Travel destination.
    duration: number;           // Travel duration.
    waitDetailList:Array<WaitDetailItemModel>; // Timeouts.
    dataSign?: string;          // Travel signature.
    containSign?: boolean;      // Travel signature flag.
    tollPrice: number;          // Total toll expense.
    parking: number;            // Total parking expense.
    otherCost: number;          // Total other cost expense.
    additionalStop: number;     // AdditionalStops.
    waitTimePrice: number;      // Total timeouts expense.
    waitTime: number;           // Total toll time.
    tollList: TollDetailItemModel[];
    parkingList: ParkingDetailItemModel[];
    otherCostList: OtherCostDetailItemModel[];
    token:string;
    cardDetail : CardDetail;
    qrPayment: boolean;
    auditInfo: TravelAuditModel;
    driverTechnicalLog: string;
    driverRateValues: string;
    useDistanceMatrix: boolean;
}

export interface CardDetail {
  token:string,
  cardId:number,
  externalCardId:number,
  lastFourDigits:string,
  firstSixDigits:string,
  expirationYear:number,
  expirationMonth:number,
  issuerName:string,
  issuerId:number,
  paymentTypeId:string,
  paymentMethodId:string;
  cardholderName:string,
  cardholderIdentificationNumber:string,
  cardholderIdentificationType:string,
  cardNumber: string,
  cvv: string
}

export interface IPayTravelResponse extends ICommandResponse {

}
