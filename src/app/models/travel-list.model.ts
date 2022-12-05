import { PaymentMethodValueEnum } from '../services/enum/paymentMethod';

export class TravelListModel {
    creationDate: Date = new Date();
    creationDay: string = new Date().getDate().toString();
    creationMonth: string = new Date().getMonth().toString();
    creationHour: string = new Date().getHours().toString();
    creationMinutes: string = new Date().getMinutes().toString();
    //creationShortDate: string = "";
    origin = '';
    destination = '';
    finalPrice = 0;
    simulatePrice = 0;
    hideAmountsDriver = false;
    state = '';
    passengerFirstName = '';
    passengerLastName = '';
    travelId = 0;
    travelIdForCarrier = 0;
    paymentMethod: PaymentMethodValueEnum;//CASH, CHECKING_ACCOUNT, TRANSFER
    serverState = '';
    originPlatform = '';
    waypoints: any[] = [];
    roundTrip = false;
    avoidTolls: boolean;
    avoidHighways: boolean;
    ETAFromBase: number;
    affiAgreementId = 0;
    distanceToPPUP = 0;

    public showTravel: boolean;
}
