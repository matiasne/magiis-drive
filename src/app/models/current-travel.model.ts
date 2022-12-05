import { PlaceModel } from './place.model';
import { CheckingAccount } from "../services/connection/command/goingToClient.command";
import { TravelRateRuleModel } from "./travel-rate-rule.model";
import { TravelStatusEnum } from "../services/enum/travelStatus";
import { FrequentDestinationModel } from "./frequent-destination.model";
import { WaitDetailItemModel } from './wait-detail-item.model';
import { TollDetailItemModel } from './toll-detail-item.model';
import { ParkingDetailItemModel } from './parking-detail-item.model';
import { RouteWaypointModel } from './routeWaypoint.model';
import {RentTypeEnum} from "../services/enum/rent-type.enum";
import { OtherCostDetailItemModel } from './other-cost-detail-item.model';
import { TravelAuditModel } from './travel-audit.model';
import { IPayTravelCommandParameters } from '../services/connection/command/payTravel.command';
import { TravelAffiliateSettingsModel } from './travel-affiliate-settings.model';
import { TravelAffiliateDataModel } from './travel-affiliate-data.model';

export class CurrentTravelModel {

    // local
    startTravelTime: Date;
    routeWaypoints : Array<RouteWaypointModel> = [];
    origRouteWaypoints : Array<RouteWaypointModel> = [];
    sortedRouteWaypoints : Array<RouteWaypointModel> = [];

    //from push notification
    note: string = "";
    passengerName: string = "";
    travelStatus: TravelStatusEnum = TravelStatusEnum.travelConfirm;
    state: TravelStatusEnum = null; // TravelStatus from the Server.
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
    /**Original simulated distance */
    km: number = 0;//simulated distance
    originPlatform: string = "";
    travelIdForCarrier: number = 0;

    origin: PlaceModel;
    destination: PlaceModel;

    //from server response
    passengerId: number = 0;
    checkingAccount: CheckingAccount = new CheckingAccount();
    pricePerKM: number = 0;
    endTolerancePercent: number = 0.1;
    rateRules: Array<TravelRateRuleModel> = new Array<TravelRateRuleModel>();
    waypoints: PlaceModel[] = [];
    travelDuration: number = 0;
    taxiingDistance: number = 0;
    lapDistance: number = 0;
    taxiingAdjustmentCoeff: number = 0;
    isProgrammed: boolean = false;
    travelDate: Date = null;
    hideAmountsDriver: boolean;
    hideAmountsAffiliate: boolean;
    affiliateData: TravelAffiliateDataModel;
    affiliateSettings: TravelAffiliateSettingsModel;

    /**New calculated real distance */
    travelLength: number = 0;//actual distance from point to point (to be calculated)
    roundTripLength : number = 0;
    lastWaypointsDistance: number = 0;
    frequentDestination: FrequentDestinationModel = null;
    avoidTolls: boolean;
    avoidHighways: boolean;
    fastestRoute: boolean;

    waitMinutes: number = null;
    priceToll: number = null;
    priceParking: number = null;
    priceOtherCost: number = null;
    priceWaitTime: number = 0;
    additionalStops: number = 0;
    waitDetailList: Array<WaitDetailItemModel> = null;
    tollList: Array<TollDetailItemModel> = null;
    parkingList: Array<ParkingDetailItemModel> = null;
    otherCostList: Array<OtherCostDetailItemModel> = null;
    initTimer: Date = null;
    totalCostPartial = 0;
    totalCostFinal = 0;
    transferCost = 0;
    totalTransferCost = 0;
    passengerPhoneNumber = "";
    usesGeofence: boolean;
    mercadoPagoAvailable: boolean;
    mercadopagoAppCode: string;
    auditInfo: TravelAuditModel = new TravelAuditModel();

    //valores finales del viaje
    finalDistance: number = 0;
    finalDistanceReturnTrip : number = 0;
    finalDestination: PlaceModel = new PlaceModel(); //the final destination where the trip really finishes.
    duration: number = 0; //the finall real duration
    roundTrip: boolean = false;
    isFrecuent: boolean = false;

    visitedWaypoints  : PlaceModel[] = [];  // Visited waypoints.
    pendingWaypoints  : PlaceModel[] = [];  // Pending waypoints to visit.
    currentSegment    : number = null;

    rental: boolean = false;
    rentHours: number = 0;
    rentType: RentTypeEnum;

    qrPayment: boolean = false;

    briefCardDetail : {
	    paymentTypeId:string;
	    paymentMethodId:string;
	    lastFourDigits:string;
    }

    paymentSettings: Array<{
      paymentMethod:string,
      isEnabled:boolean
    }>;

    requesterUserContractor:boolean;

    paymentData: IPayTravelCommandParameters;
    useDistanceMatrix: boolean;



    constructor() {
      if (!this.routeWaypoints) {
        this.routeWaypoints = new Array<RouteWaypointModel>();
      }
      if (!this.visitedWaypoints) {
        this.visitedWaypoints = [];
      }

      if (!this.pendingWaypoints) {
        this.pendingWaypoints = [];
      }


    }

 }
