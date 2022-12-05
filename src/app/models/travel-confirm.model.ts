import {PlaceModel} from "./place.model";

export class TravelConfirmModel {
    state: string = "";
    time: string = "";
    cost: number = 0;
    fromLat: string = "";
    fromLong: string = "";
    fromName: string = "";
    toLat: string = "";
    toLong: string = "";
    toName: string = "";
    paymentMethod: string = "";
    company: string = "";
    travelId: number = 0;
    travelIdForCarrier: number = 0;
    km: number = 0;
    originPlatform: string = "";
    note: string = "";
    passengerName: string = "";
    waypoints: PlaceModel[] = [];
    roundTrip: boolean = false;
    avoidTolls: boolean = false;
    avoidHighways: boolean = false;
    fastestRoute: boolean = false;
    passengerImage: string;
    travelType: string;
    rental: boolean = false;
    isProgrammed: boolean = false;
    travelDate: Date;
    hideAmountsDriver: boolean;
    affiliateData: any;
 }
