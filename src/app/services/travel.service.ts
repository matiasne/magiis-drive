import { Injectable } from "@angular/core";
import { ConnectionServices } from "./connection/connection.service";
import {
  AcceptTravelCommand,
  IAcceptTravelCommandParameters
} from "./connection/command/acceptTravel.command";
import {
  AddAdditionalsInTravelCommand,
  IAddAdditionalsInTravelCommandParameters
} from "./connection/command/addAditionalsInTravel.command";
import {
  IPayTravelCommandParameters,
  PayTravelCommand
} from "./connection/command/payTravel.command";
import {
  ILogTravelCommandParameters,
  LogTravelCommand
} from "./connection/command/logTravel.command";
import {
  GoingToClientCommand,
  IGoingToClientCommandParameters
} from "./connection/command/goingToClient.command";
import {
  GoingToDestinationCommand,
  IGoingToDestinationCommandParameters
} from "./connection/command/goingToDestination.command";
import {
  ArriveToDestinationCommand,
  IArriveToDestinationCommandParameters
} from "./connection/command/arriveToDestination.command";

import {
  RefuseTravelCommand,
  IRefuseTravelCommandParameters
} from "./connection/command/refuseTravel.command";
import {
  CancelTravelCommand,
  ICancelTravelCommandParameters
} from "./connection/command/cancelTravel.command";
import { CurrentTravelModel } from "../models/current-travel.model";
import { StorageService } from "./storage/storage.service";
import { StorageKeyEnum } from "./storage/storageKeyEnum.enum";
import {
  ITravelListCommandParameters,
  TravelListCommand
} from "./connection/command/travelList.command";
import { IdentityService } from "./identity.service";
import {
  TravelServerStatusEnum,
  TravelStatusLabelEnum
} from "./enum/travel-server-status.enum";
import {
  ITravelDetailCommandParameters,
  TravelDetailCommand
} from "./connection/command/travelDetail.command";
import { PlaceModel } from "../models/place.model";
import { TravelStatusEnum } from "./enum/travelStatus";
import {
  StatsCommand,
  IStatsCommandParameters
} from "./connection/command/stats.command";
import { WaitDetailItemModel } from "../models/wait-detail-item.model";
import {
  ReadParametersCommand,
  IReadParametersCommandRequest
} from "./connection/command/getCarrierConfigurationParameters.command";
import { TollDetailItemModel } from "../models/toll-detail-item.model";
import { BehaviorSubject } from "rxjs";
import { ParkingDetailItemModel } from "../models/parking-detail-item.model";
import { TravelTotalDetailedCostModel } from "../models/travel-total-detailed-cost.model";
import { TravelUpdate } from "../models/travel-update.model";
import { PutTravelCommand } from "./connection/command/putTravel.command";
import { TravelSignatureCommand, ITravelSignatureCommandParameters } from './connection/command/getTravelSignature.command';
import { TravelDetailModel } from '../models/travel-detail.model';
import { Location } from '../models/location.model';
import { GetWaypointsCommand } from './connection/command/getSynchronizedWaypoints.command';
import { RouteWaypointModel } from '../models/routeWaypoint.model';
import { NavigationService } from './navigation.service';
import { GetTravelTollCommand, IGetTravelTollCommandParameters } from './connection/command/getTravelToll.command';
import { GetTravelParkingCommand, IGetTravelParkingCommandParameters } from './connection/command/getTravelParking.command';
import { PutTravelTollCommand } from './connection/command/putTravelToll.command';
import { PutTravelParkingCommand } from './connection/command/putTravelParking.command';
import { ITollDetailResponse, IParkingDetailResponse, IOtherCostDetailResponse } from './connection/interfaces/apiInterfaces';
import { ISignTravelCommandParameters, SignTravelCommand } from "./connection/command/SignTravelCommand";
import { OtherCostDetailItemModel } from '../models/other-cost-detail-item.model';
import { GetTravelOtherCostCommand, IGetTravelOtherCostCommandParameters } from './connection/command/getTravelOtherCost.command';
import { PutTravelOtherCostCommand } from './connection/command/putTravelOtherCost.command';
import { IUpdateTravelAuditCommandParameters, UpdateTravelAuditCommand } from './connection/command/travelAudit.command';
import { GetQrPaymentCommand, IGetQrPaymentCommandParameters } from './connection/command/getQrPayment.command';
import { CancelQrPaymentCommand, ICancelQrPaymentCommandParameters } from './connection/command/cancelQrPayment.command';
import { IStartStreetTravelCommandParameters, StartStreetTravelCommand } from "./connection/command/start-street-travel.command";
import { TravelAuditModel } from "../models/travel-audit.model";
import { Device } from "@awesome-cordova-plugins/device/ngx";
import { GlobalProvider } from "../providers/global/global";
import { Network } from '@awesome-cordova-plugins/network/ngx';

declare var google;

@Injectable({providedIn:'root'})
export class TravelService {

  //timer
  currentWaitStartTime: Date;
  timerHandle;
  timerTicks: number = 0;
  timerSeconds: number = 0;
  timerMinutes: number = 0;
  timerOn: boolean = false;
  isStreetPassengerTravel = false;
  public synchronizeObserver = null;

  public passengerImage: String;

  currentTravel: CurrentTravelModel = new CurrentTravelModel();
  private unsynchronizedTravels: Array<IPayTravelCommandParameters> = new Array<
    IPayTravelCommandParameters
  >();

  public showLostConectionMessage: boolean = false;

  public tollList$: BehaviorSubject<Array<TollDetailItemModel>> = new BehaviorSubject([]);
  public parkingList$: BehaviorSubject<Array<ParkingDetailItemModel>> = new BehaviorSubject([]);
  public otherCostList$: BehaviorSubject<Array<OtherCostDetailItemModel>> = new BehaviorSubject([]);
  public tollExpense$: BehaviorSubject<number> = new BehaviorSubject(0);
  public parkingExpense$: BehaviorSubject<number> = new BehaviorSubject(0);
  public otherCostExpense$: BehaviorSubject<number> = new BehaviorSubject(0);

  public currentTravelRemoved$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public travelSyncronized$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  geocercaRatio: number | null;
  public pickUpPoint:RouteWaypointModel;
  public dropOffPoint:RouteWaypointModel;

  realVisitedWaypoint: RouteWaypointModel[] = new Array<RouteWaypointModel>();

  constructor(
    private connectionService: ConnectionServices,
    private storageService: StorageService,
    private identityService: IdentityService,
    private network: Network,
    private navigationService: NavigationService,
    private device: Device,
   private global: GlobalProvider,
  ) {
    this.getGeocercaStatus();
  }

  public saveCurrentTravel(addRealVisitedWaypoint?: boolean) {

    this.initializeVitalValues();

    this.storageService.setObject(
      StorageKeyEnum.currentTravel,
      this.currentTravel
    );
  }

  /* Saves pickUpPoint to local storage */
  public savePickUpPointToStorage(){
    this.storageService.setObject(
      StorageKeyEnum.pickUpPoint,
      this.pickUpPoint
    );
  }

  /* Saves dropOffPoint to local storage */
  public saveDropOffPointToStorage(dropOffPoint: RouteWaypointModel){
    this.storageService.setObject(
      StorageKeyEnum.dropOffPoint,
      dropOffPoint
    );
  }

  /* retrieves pickUpPoint from local storage */
  public getPickUpPointFromStorage(){
    return this.storageService.getData(StorageKeyEnum.pickUpPoint);
  }

  /* retrieves dropOffPoint from local storage */
  public getDropOffPointFromStorage(){
    return this.storageService.getData(StorageKeyEnum.dropOffPoint);
  }

  /** Add a waypoint to currentTravel.routeWaypoints*/
  setWaypoint(latitude: number, longitude: number, timestamp: string) {
    if (this.currentTravel.routeWaypoints == null) {
      this.currentTravel.routeWaypoints = new Array<RouteWaypointModel>();
    }

    const point = new RouteWaypointModel(
      <Location>{
        lat: latitude,
        lng: longitude
      },
      this.currentTravel.currentSegment ? this.currentOrigin.id : null,
      this.currentTravel.currentSegment,
      timestamp
    );

    this.currentTravel.routeWaypoints.push(point);
    this.saveCurrentTravel();
  }

  getWaypointsAsLatLng(): google.maps.LatLng[] {
    if (!this.currentTravel.sortedRouteWaypoints) {
      return [];
    }
    return this.currentTravel.sortedRouteWaypoints.map(
      (wp: RouteWaypointModel) => new google.maps.LatLng(wp.location.lat, wp.location.lng)
    );
  }

  async getWaypointsRealVisitedAsLatLng() {
    const result = await this.storageService.getData(StorageKeyEnum.realVisitedWaypoint);
    return result ? JSON.parse(result).map((wp: RouteWaypointModel) => new google.maps.LatLng(wp.location.lat, wp.location.lng)) : [];
  }

  getLastSegmentWaypointsAsLatLng(): google.maps.LatLng[] {
    try {
      const lastSegment = this.currentTravel.sortedRouteWaypoints
        .map(rw => rw.segment)
        .reduce((prev, current) => (prev > current) ? prev : current);

      const waypoints = this.currentTravel.sortedRouteWaypoints
        .filter(rW => rW.segment === lastSegment)
        .map(w => new google.maps.LatLng(+w.location.lat, +w.location.lng));

      return waypoints;
    } catch (error) {
      return [];
    }
  }

  getLastSegmentFromSortedRouteWaypoints(): google.maps.LatLng[] {
    try {
      const lastSegment = this.currentTravel.sortedRouteWaypoints
        .map(rw => rw.segment)
        .reduce((prev, current) => (prev > current) ? prev : current);

      const waypoints = this.currentTravel.sortedRouteWaypoints
        .filter(rW => rW.segment === lastSegment)
        .map(w => new google.maps.LatLng(+w.location.lat, +w.location.lng));

      return waypoints;
    } catch (error) {
      return [];
    }
  }

  async getTravelToll(
    carrierId: number,
    travelId: number,
    tollId: number
  ): Promise<ITollDetailResponse> {
    const getTravelTollCommand = new GetTravelTollCommand();
    getTravelTollCommand.setParameters(
      <IGetTravelTollCommandParameters>{
        carrierId,
        travelId,
        tollId
      }
    );
    return this.connectionService
      .Request(getTravelTollCommand)
      .then(response => response)
      .catch(error => { throw error })

  }

  async getTravelParking(
    carrierId: number,
    travelId: number,
    parkingId: number
  ): Promise<IParkingDetailResponse> {
    const getTravelParkingCommand = new GetTravelParkingCommand();
    getTravelParkingCommand.setParameters(
      <IGetTravelParkingCommandParameters>{
        carrierId,
        travelId,
        parkingId
      }
    );
    return this.connectionService
      .Request(getTravelParkingCommand)
      .then(response => response)
      .catch(error => { throw error })

  }

  async getTravelOtherCost(
    carrierId: number,
    travelId: number,
    otherCostId: number
  ): Promise<IOtherCostDetailResponse> {
    const getTravelOtherCostCommand = new GetTravelOtherCostCommand();
    getTravelOtherCostCommand.setParameters(
      <IGetTravelOtherCostCommandParameters>{
        carrierId,
        travelId,
        otherCostId
      }
    );
    return this.connectionService
      .Request(getTravelOtherCostCommand)
      .then(response => response)
      .catch(error => { throw error })

  }

  async updateTravelToll(
    carrierId: number,
    travelId: number,
    tollUpdated: ITollDetailResponse
  ): Promise<ITollDetailResponse> {
    const command = new PutTravelTollCommand();
    command.setUrlParameters(
      carrierId,
      travelId,
      tollUpdated.id
    );
    command.addCommandBody(tollUpdated);

    return this.connectionService
      .Request(command)
      .then(response => response)
      .catch(error => { throw error });
  }

  async updateTravelParking(
    carrierId: number,
    travelId: number,
    parkingUpdated: IParkingDetailResponse
  ): Promise<IParkingDetailResponse> {
    const command = new PutTravelParkingCommand();
    command.setUrlParameters(
      carrierId,
      travelId,
      parkingUpdated.id
    );
    command.addCommandBody(parkingUpdated);

    return this.connectionService
      .Request(command)
      .then(response => response)
      .catch(error => { throw error });
  }

  async updateTravelOtherCost(
    carrierId: number,
    travelId: number,
    otherCostUpdated: IOtherCostDetailResponse
  ): Promise<IOtherCostDetailResponse> {
    const command = new PutTravelOtherCostCommand();
    command.setUrlParameters(
      carrierId,
      travelId,
      otherCostUpdated.id
    );
    command.addCommandBody(otherCostUpdated);

    return this.connectionService
      .Request(command)
      .then(response => response)
      .catch(error => { throw error });
  }

  addUnsynchronizedTravel(travel: IPayTravelCommandParameters) {
    this.unsynchronizedTravels.push(travel);
    this.storageService.setObject(
      StorageKeyEnum.pendingTravels,
      this.unsynchronizedTravels
    );
  }

  private updateUnsynchronizedTravel() {
    return this.storageService.setObject(
      StorageKeyEnum.pendingTravels,
      this.unsynchronizedTravels
    );
  }

  loadUnsynchronizedTravels() {
    let data = this.storageService
      .getData(StorageKeyEnum.pendingTravels)
        if (data != null) {
          this.unsynchronizedTravels = JSON.parse(data);
          console.log("unsynchronizedTravels: ", this.unsynchronizedTravels);
          this.synchronizeOfflineData();
        }
        return data != null ? JSON.parse(data) : [];
    
  }

  async loadTripInOfflineMode(): Promise<CurrentTravelModel> {

    const localTravel = await this.storageService.getData(StorageKeyEnum.currentTravel);

    this.pickUpPoint = this.getPickUpPointFromStorage();
    this.dropOffPoint = this.getDropOffPointFromStorage();

    if ( !localTravel ) return Promise.reject(new Error('No se encontró ningun viaje a ser cargado.'));

    console.log('Trvel from storage');
    console.log(localTravel);

    return localTravel;

  }

  synchronizeOfflineData(): Promise<boolean> {
    if (this.synchronizeObserver == null) {
      this.synchronizeObserver = this.network.onConnect().subscribe(() => {
        // Need to wait briefly before we determine the connection type. Might need to wait prior to doing any api requests as well.
        setTimeout(() => {
          this.uploadUnsynchronizedTravelList();
        }, 3000);
      });
    }
    //force it at least one time
    return this.uploadUnsynchronizedTravelList();
  }

  uploadUnsynchronizedTravelList(): Promise<boolean> {
    if (this.unsynchronizedTravels.length > 0) {
      return this.uploadUnsynchronizedTravel(this.unsynchronizedTravels[0]);
    } else {
      return Promise.resolve(false);
    }
  }

  uploadUnsynchronizedTravel(
    travel: IPayTravelCommandParameters
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.pay(travel)
        .then(success => {
          this.unsynchronizedTravels.shift();
          this.updateUnsynchronizedTravel();
          console.log("Viaje ", travel.travelId, " sincronizado correctamente");
          this.travelSyncronized$.next(true);
          resolve(true);
        })
        .catch(err => {
          if (err.status !== 0) {
            console.error(
              "Ocurrió un error con la sincronización de datos, se cancela.",
              "Viaje ",
              travel.travelId
            );
            console.error(err);
            this.unsynchronizedTravels.shift();
            this.updateUnsynchronizedTravel();
          }
          reject();
        });
    });
  }

  public removeCurrentTravel() {
    this.storageService.deleteData(StorageKeyEnum.currentTravel);
    this.currentTravel = new CurrentTravelModel();
    this.removeTimerTravelValues();
    this.currentTravelRemoved$.next(true);
    this.currentTravelRemoved$.next(false);
  }

  public acceptTravel(
    driverUserId: string,
    travelId: number,
    carrierUserId: string
  ) {
    const acceptTravelCommand = new AcceptTravelCommand();
    acceptTravelCommand.setParameters(<IAcceptTravelCommandParameters>{
      driverUserId: driverUserId,
      travelId: travelId,
      carrierUserId: carrierUserId
    });

    return this.connectionService
      .Request(acceptTravelCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getTravelSignature(travelId: number): Promise<any> {
    const travelSignatureCommand: TravelSignatureCommand = new TravelSignatureCommand();
    travelSignatureCommand.setParameters(<ITravelSignatureCommandParameters>{
      carrierId: +this.identityService.carrierUserId,
      travelId: travelId
    });

    return this.connectionService
      .Request(travelSignatureCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });

  }

  public timerReset() {
    this.timerTicks = 0;
    this.timerSeconds = 0;
    this.timerMinutes = 0;
    this.timerOn = false;
  }

  public timer(on: boolean, date?: Date) {
    if (on) {
      let oldTimerTicks = this.timerTicks;
      let startDate: Date = date;
      this.timerHandle = setInterval(() => {
        if(this.validateIsDateNetwork()) {
          const {timeDevice} = this.getDatesDeviceAndTravel();
          this.timerTicks = Math.floor(
            (timeDevice - startDate.getTime()) / 1000 + oldTimerTicks
          );
          this.timerMinutes = Math.floor(this.timerTicks / 60);
          this.timerSeconds = this.timerTicks - this.timerMinutes * 60;
        }
      }, 1000);
    } else {
      clearInterval(this.timerHandle);
    }
  }

  public refuseTravel(
    travelId: number,
    carrierUserId: number,
    driverUserId: number
  ) {
    const refuseTravelCommand = new RefuseTravelCommand();
    refuseTravelCommand.setParameters(<IRefuseTravelCommandParameters>{
      travelId: travelId,
      carrierUserId: carrierUserId,
      driverUserId: driverUserId
    });

    return this.connectionService
      .Request(refuseTravelCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public cancelTravel(
    travelId: number,
    carrierUserId: number,
    reasonForCancellation: string
  ) {
    const cancelTravelCommand = new CancelTravelCommand();
    cancelTravelCommand.setParameters(<ICancelTravelCommandParameters>{
      travelId: travelId,
      carrierUserId: carrierUserId,
      reasonForCancellation: reasonForCancellation,
      canceledBy: "DRIVER"
    });

    return this.connectionService
      .Request(cancelTravelCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public cancelScheduledTravel(
    travelId: number,
    carrierUserId: number,
    reasonForCancellation: string
  ) {
    const cancelTravelCommand = new CancelTravelCommand();
    cancelTravelCommand.setParameters(<ICancelTravelCommandParameters>{
      travelId: travelId,
      carrierUserId: carrierUserId,
      reasonForCancellation: reasonForCancellation,
      canceledBy: "DRIVER"
    });

    return this.connectionService
      .Request(cancelTravelCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public goingToClient(
    travelId: number,
    carrierUserId: number,
    driverUserId: number
  ) {
    const goingToClientCommand = new GoingToClientCommand();
    goingToClientCommand.setParameters(<IGoingToClientCommandParameters>{
      travelId: travelId,
      carrierUserId: carrierUserId,
      driverUserId: driverUserId
    });

    return this.connectionService
      .Request(goingToClientCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public goingToDestination(travelId: number, carrierUserId: number, codeOK: boolean) {
    const goingToDestinationCommand = new GoingToDestinationCommand();
    goingToDestinationCommand.setParameters(<
      IGoingToDestinationCommandParameters
      >{
        travelId: travelId,
        carrierUserId: carrierUserId,
        codeOK: codeOK
      });

    return this.connectionService
      .Request(goingToDestinationCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public arriveToDestination(
    travelId: number,
    carrierUserId: number
  ): Promise<any> {
    const arriveToDestinationCommand = new ArriveToDestinationCommand();
    arriveToDestinationCommand.setParameters(<
      IArriveToDestinationCommandParameters
      >{
        travelId: travelId,
        carrierUserId: carrierUserId
      });

    return this.connectionService.Request(arriveToDestinationCommand);
  }

  public addAdditionals(additionals: IAddAdditionalsInTravelCommandParameters) {
    const addAditionalsInTravel = new AddAdditionalsInTravelCommand();
    addAditionalsInTravel.setParameters(additionals);

    return this.connectionService
      .Request(addAditionalsInTravel)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getQrPayment(parameters: IGetQrPaymentCommandParameters) {
    const getQrPaymentCommand = new GetQrPaymentCommand();
    getQrPaymentCommand.setParameters(parameters);
    return this.connectionService
      .Request(getQrPaymentCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public cancelQrPayment(parameters: ICancelQrPaymentCommandParameters) {
    const cancelQrPaymentCommand = new CancelQrPaymentCommand();
    cancelQrPaymentCommand.setParameters(parameters);
    return this.connectionService
      .Request(cancelQrPaymentCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public pay(payTravel: IPayTravelCommandParameters) {
    const payTravelCommand = new PayTravelCommand();
    payTravelCommand.setParameters(payTravel);
    console.log("#Paytravel=> travel.service.ts",payTravel);
    return this.connectionService
      .Request(payTravelCommand)
      .then(response => {
        console.log("#Paytravel=> travel.service.ts","reciboRespuesta");
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public log(logTravel: ILogTravelCommandParameters) {
    const logTravelCommand = new LogTravelCommand();

    logTravelCommand.setParameters(logTravel);

    return this.connectionService
      .Request(logTravelCommand)
      .then(response => {
        console.log("#LogTravelCommand=> travel.service.ts","reciboRespuesta");
        return response;
    })
      .catch(error => {
        console.error("#LogTravelCommand=> travel.service.ts",error);
        return true;
    });

  }

  public sign(signatureTravel: ISignTravelCommandParameters) {
    const signTravelCommand = new SignTravelCommand();
    signTravelCommand.setParameters(signatureTravel);

    return this.connectionService
      .Request(signTravelCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getTravelList(scheduled: boolean, page: number, size: number) {
    var parameters = <ITravelListCommandParameters>{
      carrierUserId: +this.identityService.carrierUserId,
      driverId: +this.identityService.userId,
      page: page,
      size: size,
      column: "id",
      sort: "DESC",
      scheduled: scheduled
    };
    const travelListCommand = new TravelListCommand();
    travelListCommand.setParameters(parameters);

    return this.connectionService
      .Request(travelListCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getTravelDetail(travelId: number): Promise<TravelDetailModel> {
    var parameters = <ITravelDetailCommandParameters>{
      carrierUserId: +this.identityService.carrierUserId,
      travelId: travelId
    };
    const travelDetailCommand = new TravelDetailCommand();
    travelDetailCommand.setParameters(parameters);

    return this.connectionService
      .Request(travelDetailCommand)
      .then((response: TravelDetailModel) => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getStats(dateFrom: Date, dateTo: Date) {
    console.log("dateFrom.getTimezoneOffset()", dateFrom.getTimezoneOffset());
    console.log("dateTo.getTimezoneOffset()", dateTo.getTimezoneOffset());
    console.log("dateFrom - offset : ", dateFrom);
    console.log("dateFrom - offset : ", dateTo);

    const reportLocationCommand = new StatsCommand();
    reportLocationCommand.setParameters(<IStatsCommandParameters>{
      carrierUserId: +this.identityService.carrierUserId,
      driverUserId: +this.identityService.userId,
      dateFrom: dateFrom,
      dateTo: dateTo
    });

    return this.connectionService
      .Request(reportLocationCommand)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public getTravelStatuslabel(state: string) {
    switch (state) {
      case TravelServerStatusEnum.SEARCHING_DRIVER:
        return TravelStatusLabelEnum.SEARCHING_DRIVER;
      case TravelServerStatusEnum.WITH_DRIVER_ASSIGNED:
        return TravelStatusLabelEnum.WITH_DRIVER_ASSIGNED;
      case TravelServerStatusEnum.GOING_TO_CLIENT:
        return TravelStatusLabelEnum.GOING_TO_CLIENT;
      case TravelServerStatusEnum.GOING_TO_DESTINATION:
        return TravelStatusLabelEnum.GOING_TO_DESTINATION;
      case TravelServerStatusEnum.ARRIVE_TO_DESTINATION:
        return TravelStatusLabelEnum.ARRIVE_TO_DESTINATION;
      case TravelServerStatusEnum.WAITING_FOR_PAYMENT:
        return TravelStatusLabelEnum.WAITING_FOR_PAYMENT;
      case TravelServerStatusEnum.DONE:
        return TravelStatusLabelEnum.DONE;
      case TravelServerStatusEnum.CANCELLED:
        return TravelStatusLabelEnum.CANCELLED;
      default:
        break;
    }
  }

  getStatusOrder(status: TravelStatusEnum) {
    console.log("getStatusOrder: ", status);
    switch (status) {
      case TravelStatusEnum.travelToStart:
        return 1;
      case TravelStatusEnum.travelInProgress:
        return 2;
      case TravelStatusEnum.travelResume:
        return 3;
      default:
        return 1000;
    }
  }

  public getTravelScheduledStatuslabel(state: string) {
    switch (state) {
      case TravelServerStatusEnum.SEARCHING_DRIVER:
        return TravelStatusLabelEnum.SEARCHING_DRIVER_SCHEDULED;
      case TravelServerStatusEnum.WITH_DRIVER_ASSIGNED:
        return TravelStatusLabelEnum.WITH_DRIVER_ASSIGNED_SCHEDULED;
      case TravelServerStatusEnum.GOING_TO_CLIENT:
        return TravelStatusLabelEnum.GOING_TO_CLIENT;
      case TravelServerStatusEnum.GOING_TO_DESTINATION:
        return TravelStatusLabelEnum.GOING_TO_DESTINATION;
      case TravelServerStatusEnum.ARRIVE_TO_DESTINATION:
        return TravelStatusLabelEnum.ARRIVE_TO_DESTINATION;
      case TravelServerStatusEnum.WAITING_FOR_PAYMENT:
        return TravelStatusLabelEnum.WAITING_FOR_PAYMENT;
      case TravelServerStatusEnum.DONE:
        return TravelStatusLabelEnum.DONE;
      case TravelServerStatusEnum.CANCELLED:
        return TravelStatusLabelEnum.CANCELLED;
      case TravelServerStatusEnum.LOST:
        return TravelStatusLabelEnum.LOST;
      default:
        break;
    }
  }

  public getParameters(): Promise<any> {
    var parameters = <IReadParametersCommandRequest>{
      carrierUserId: +this.identityService.carrierUserId
    };
    let command = new ReadParametersCommand();
    command.setParameters(parameters);
    return this.connectionService
      .Request(command)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public setCurrentWaitStartTime(): void {
    let startTime = new Date();
    this.currentWaitStartTime = startTime;
    this.storageService.setData(StorageKeyEnum.currentWaitStartTime, startTime);
  }

  public getCurrentWaitStartTime(): Promise<any> {
    return this.storageService.getData(StorageKeyEnum.currentWaitStartTime);
  }

  public setWaitEndTime(waitEndTime: Date) {
    this.storageService.setData(StorageKeyEnum.waitEndTime, waitEndTime);
  }

  public getWaitEndTime(): Promise<any> {
    return this.storageService.getData(StorageKeyEnum.waitEndTime);
  }

  public setInitTimer(val: Date): void {
    this.currentTravel.initTimer = val;
    this.updateCurrentTravel();
  }

  public setTimerOn(val: boolean): void {
    this.storageService.setData(StorageKeyEnum.timerOn, val);
    this.timerOn = val;
  }

  public getTimerOn(): Promise<any> {
    return this.storageService.getData(StorageKeyEnum.timerOn);
  }

  public setMinutesAndSeconds(min: number, secs: number): void {
    this.timerMinutes = min;
    this.timerSeconds = secs;
  }

  public setTravelCosts(detailedCosts: TravelTotalDetailedCostModel) {
    // Update travel costs.
    this.currentTravel.totalCostFinal = detailedCosts.totalCostFinal;
    this.currentTravel.totalCostPartial = Math.round(
      detailedCosts.totalCostFinal -
      detailedCosts.waitTimePrice -
      detailedCosts.parkingPrice -
      detailedCosts.tollPrice -
      detailedCosts.otherCostPrice
    );
    this.currentTravel.priceWaitTime =
      this.currentTravel.rental
        ? 0
        : Math.round(detailedCosts.waitTimePrice);
    this.currentTravel.priceParking = detailedCosts.parkingPrice;
    this.currentTravel.priceToll = detailedCosts.tollPrice;
    this.currentTravel.priceOtherCost = detailedCosts.otherCostPrice;

    // Update BehaviorSubjects.
    this.parkingExpense$.next(detailedCosts.parkingPrice);
    this.tollExpense$.next(detailedCosts.tollPrice);
    this.otherCostExpense$.next(detailedCosts.otherCostPrice);

    // Update currentTravel.
    this.updateCurrentTravel();
  }

  public setPriceWaitTime(price: number) {
    this.currentTravel.priceWaitTime = price;
    this.updateCurrentTravel();
  }

  /**
   * Update current travel from localstorage data.
   */
  public restoreCurrentTravelValues(): void {
    this.restoreTravelWaypoints(this.currentTravel.travelId);
    this.getCurrentWaitStartTime().then(data => {
      if (data !== null) {
        this.currentWaitStartTime = data;
      }
    });
    this.getTimerOn().then(data => {
      if (data !== null) {
        this.timerOn = data;
      }
    });
    this.tollList$.next(this.currentTravel.tollList);
    this.parkingList$.next(this.currentTravel.parkingList);
    this.otherCostList$.next(this.currentTravel.otherCostList);
  }

  public removeTimerTravelValues(): void {
    this.storageService.deleteData(StorageKeyEnum.currentWaitStartTime);
    this.storageService.deleteData(StorageKeyEnum.waitEndTime);
    this.storageService.deleteData(StorageKeyEnum.timerOn);
  }

  /**
   * Update currentTravel in LocalStorage.
   */
  public updateCurrentTravel(): void {
    this.storageService.setObject(
      StorageKeyEnum.currentTravel,
      this.currentTravel
    );
  }

  /**
   * Parsea a @Object el dato recibido para asignarselo a currentTravel.
   * Tambien normaliza las fechas, ya que al recuperarse de LocalStorage pierden
   * el formato.
   * @param data {currentTravel}
   */
  public parseCurrentTravel(data: any): void {
    this.currentTravel = new CurrentTravelModel();
    this.currentTravel = JSON.parse(data);
    this.currentTravel.startTravelTime = new Date(
      this.currentTravel.startTravelTime
    );
    this.currentTravel.initTimer = new Date(this.currentTravel.initTimer);
  }

  public updateTravel(
    travel: TravelUpdate,
    carrierUserId: number
  ): Promise<void> {
    let command = new PutTravelCommand();
    command.setUrlParameters(carrierUserId, travel.id);
    command.addCommandBody(travel);

    return this.connectionService
      .Request(command)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  public mergeUpdatedTravel(serverCurrentTrip: CurrentTravelModel) {
    serverCurrentTrip.travelStatus = this.currentTravel.travelStatus;
    serverCurrentTrip.startTravelTime = this.currentTravel.startTravelTime;
    serverCurrentTrip.waitDetailList = this.currentTravel.waitDetailList;
    serverCurrentTrip.travelDuration = this.currentTravel.travelDuration;
    serverCurrentTrip.travelLength = this.currentTravel.travelLength;
    serverCurrentTrip.routeWaypoints = this.currentTravel.routeWaypoints;
    serverCurrentTrip.visitedWaypoints = this.currentTravel.visitedWaypoints;
    serverCurrentTrip.auditInfo = this.currentTravel.auditInfo;
    serverCurrentTrip.currentSegment = this.currentTravel.currentSegment;

    serverCurrentTrip.pendingWaypoints = this.setPendingWaypoints(
      serverCurrentTrip.waypoints,
      serverCurrentTrip.visitedWaypoints,
      serverCurrentTrip.roundTrip,
      serverCurrentTrip.destination
    );

    this.currentTravel = serverCurrentTrip;

    this.saveCurrentTravel();
  }

  /**
   * Metodo principal para normalizar todos los valores de un viaje.
   * @param fromStorage Determina si se debe normalizar el viaje con el
   * localStorage o con el servidor.
   */
  public async normalizeTravelValues(travel: CurrentTravelModel, fromStorage: boolean): Promise<TravelStatusEnum> {

    try {

      if (fromStorage) { // Normalize with LocalStorage Values.
        let currentTravel = new CurrentTravelModel();
        console.log('[normalizeTravelValues]', travel)
        console.log(travel);
        currentTravel = JSON.parse(<any>travel); // Receive the trip in string from localstorage.
        // Normalize dates.
        currentTravel.startTravelTime = new Date(currentTravel.startTravelTime);
        currentTravel.initTimer = new Date(currentTravel.initTimer);
        this.currentWaitStartTime = await this.getCurrentWaitStartTime();
        this.timerOn = await this.getTimerOn();
        this.tollList$.next(currentTravel.tollList);
        this.parkingList$.next(currentTravel.parkingList);
        this.otherCostList$.next(currentTravel.otherCostList);

        if(currentTravel.travelStatus == null)
          currentTravel.travelStatus = <TravelStatusEnum>(<any>currentTravel).state;

        this.currentTravel = currentTravel;

        return Promise.resolve(currentTravel.travelStatus);

      } else { // Normalize with Server Values.

        this.currentTravel = travel;
        this.initializeVitalValues();

        if (travel.state === TravelStatusEnum.travelInProgress) {
          this.currentTravel.pendingWaypoints = this.setPendingWaypoints(
            travel.waypoints,
            [],
            travel.roundTrip,
            travel.destination
          );

          const restoreWaypoints = await this.restoreTravelWaypoints(travel.travelId);
          console.log('restoreWaypoints', restoreWaypoints);
        }

        this.updateCurrentTravel();

        return Promise.resolve(travel.state);
      }
    } catch (error) {
      return Promise.reject({
        error: error,
        message: 'Error al normalizar datos del viaje.'
      });
    }
  }

  /**
   * Load the pending destinations to visit.
   * @param waypoints Multi-Destinations.
   * @param visitedWaypoints Visited destinations.
   * @param isRoundTrip If the trip is round trip = true.
   * @param destination Travel destination.
   * @return pendingWaypoints.
   */
  public setPendingWaypoints(
    waypoints: PlaceModel[],
    visitedWaypoints: PlaceModel[],
    isRoundTrip: boolean,
    destination: PlaceModel
  ): PlaceModel[] {
    let pendingWaypoints: PlaceModel[] = [];

    if (waypoints) {
      if (visitedWaypoints.length > 0) {
        pendingWaypoints = waypoints.filter(w =>
          !visitedWaypoints.find(vW => vW.id === w.id)
        );
      } else pendingWaypoints = [...waypoints];
    }

    if (isRoundTrip && (visitedWaypoints.length == 0 || visitedWaypoints[visitedWaypoints.length - 1].placeId != destination.placeId))
      pendingWaypoints.push(destination);

    return pendingWaypoints;

  }

  public saveNewToll(tollItem: TollDetailItemModel): void {
    if (this.currentTravel.tollList == null) {
      this.currentTravel.tollList = new Array<TollDetailItemModel>();
    }
    this.currentTravel.tollList.push(tollItem);
    this.tollList$.next(this.currentTravel.tollList);
    this.updateCurrentTravel();
  }

  public saveNewParking(parkingItem: ParkingDetailItemModel): void {
    if (this.currentTravel.parkingList == null) {
      this.currentTravel.parkingList = new Array<ParkingDetailItemModel>();
    }
    this.currentTravel.parkingList.push(parkingItem);
    this.parkingList$.next(this.currentTravel.parkingList);
    this.updateCurrentTravel();
  }

  public saveOtherCost(otherCostItem: OtherCostDetailItemModel): void {
    if (this.currentTravel.otherCostList == null) {
      this.currentTravel.otherCostList = new Array<OtherCostDetailItemModel>();
    }
    this.currentTravel.otherCostList.push(otherCostItem);
    this.otherCostList$.next(this.currentTravel.otherCostList);
    this.updateCurrentTravel();
  }

  /**
   * Elimina un peaje por su posicion.
   * @param pos
   */
  public removeTollItem(pos: number): void {
    this.currentTravel.tollList.splice(pos, 1);
    this.tollList$.next(this.currentTravel.tollList);
    this.updateCurrentTravel();
  }

  /**
   * Elimina un estacionamiento por su posicion.
   * @param pos
   */
  public removeParkingItem(pos: number): void {
    this.currentTravel.parkingList.splice(pos, 1);
    this.parkingList$.next(this.currentTravel.parkingList);
    this.updateCurrentTravel();
  }

  /**
   * Elimina un costo extra por su posicion
   * @param pos
   */
  public removeOtherCostItem(pos: number): void {
    this.currentTravel.otherCostList.splice(pos, 1);
    this.otherCostList$.next(this.currentTravel.otherCostList);
    this.updateCurrentTravel();
  }

  public clearSubjects(): void {
    this.tollList$.next([]);
    this.parkingList$.next([]);
    this.otherCostList$.next([]);
    this.tollExpense$.next(0);
    this.parkingExpense$.next(0);
    this.otherCostExpense$.next(0);
  }

  /**
   * Get the synchronized waypoints of the backend.
   * @param carrierUserId Carrier Id.
   * @param travelId Travel Id.
   */
  public async getSynchronizeWaypoints(carrierUserId: number, travelId: number): Promise<any> {
    let command = new GetWaypointsCommand();
    command.setUrlParameters(carrierUserId, travelId);

    return this.connectionService
      .Request(command)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

  /**
   * Return the value of geocercaRatio.
   */
  public  getGeocercaStatus() {

    this.geocercaRatio =  this.storageService.getData(StorageKeyEnum.geocercaRatio)


        return this.geocercaRatio;


  }

  public navigateToDestination(platform: string, destination?: string) {

    this.navigationService.determineApp()
      .then(app => {
        let to: string = '';

        // Si recibo un destino lo uso, y sino lo calculo.
        if (destination) to = destination;
        else {
          const avoidTolls = this.currentTravel.avoidTolls;
          const avoidHighways = this.currentTravel.avoidHighways;
          if (app === 'waze' || platform === 'ios') {
            to += `${this.currentDestination.latitude},${this.currentDestination.longitude}`;
          }
          else {
            const waypoints = this.currentTravel.waypoints;
            if (waypoints) {
              waypoints.forEach(waypoint => {
                to += `${waypoint.latitude},${waypoint.longitude}+to:`;
              });
            }

            to += `${this.currentTravel.destination.latitude},${this.currentTravel.destination.longitude}`;

            if(this.currentTravel.roundTrip) {
              to += `+to:${this.currentTravel.origin.latitude},${this.currentTravel.origin.longitude}`;
            }

            if (avoidTolls || avoidHighways) {
              to += "&dirflg=d" + (avoidTolls ? "t" : "") + (avoidHighways ? "h" : "");
            }
          }
        }

        return this.navigationService.goToNavigationApps(to, app);
      })
      .then(success => {
        console.log(`[SUCCESS]: Go to navigationApps ${success}`);
      })
      .catch(err => {
        console.log(`[Error]: Error to navigationApps ${err}`);
      });

  }

  public goToNextDestination() {
    this.setRealVisitedWaypoint();

    this.currentTravel.visitedWaypoints.push(
      this.currentTravel.pendingWaypoints.shift()
    );

    this.currentTravel.currentSegment++;
    console.log("[Geofence]-addNextPoint",this.currentOrigin,this.currentDestination);

    this.setNextGeofence(
      this.currentOrigin.id.toString(),
      this.currentDestination.id.toString(),
      this.currentDestination
    );

    this.saveCurrentTravel();

  }

  public setRealVisitedWaypoint() {
    console.log('[Geofence]-setRealVisitedWaypoint');
    this.navigationService.getActualPosition().then(location => {
      this.realVisitedWaypoint.push(
        new RouteWaypointModel(
            {
              "lat":location.coords.latitude,
              "lng":location.coords.longitude
            },
            1,
            this.currentTravel.currentSegment,
            location.timestamp
          ));

      this.storageService.setObject(
        StorageKeyEnum.realVisitedWaypoint,
        this.realVisitedWaypoint
      );
    }).catch(error => {console.log('error getting actual position', error)});
  }

  public goToNewDestination(index: number) {
    if(index <= this.currentTravel.pendingWaypoints.length - 1) {
      for(let i = 0; i < index; i++) {
        this.currentTravel.visitedWaypoints.push(
          this.currentTravel.pendingWaypoints.shift()
        );
        this.currentTravel.currentSegment = this.increaseCurrentSegment();
      }
    } else {
      this.currentTravel.visitedWaypoints = this.currentTravel.visitedWaypoints.concat(this.currentTravel.pendingWaypoints);
      this.currentTravel.pendingWaypoints = [];
      this.currentTravel.currentSegment = this.increaseCurrentSegment();
    }

    this.setNextGeofence(
      this.currentOrigin.id.toString(),
      this.currentDestination.id.toString(),
      this.currentDestination
    );

    this.saveCurrentTravel();

  }

  public setNextGeofence(
    oldIdentifier: string,
    newIdentifier: string,
    newLocation: PlaceModel
  ) {
    /* Remove old Geofence */
    console.log('[Geofence] setNext (travelService)',newIdentifier,newLocation,this.geocercaRatio);
    this.navigationService.removeGeofence(oldIdentifier)
      .then(() => this.navigationService.addGeofence(
        newIdentifier,
        newLocation,
        this.geocercaRatio
      ))
      .then(res => console.info('[Geofence] Remove oldGeofence & Add new : SUCCESS!!'))
      .catch(err => console.error('[Geofence] Error when deleting or add : ERROR!!'));
  }

  get currentOrigin(): PlaceModel {
    const length = this.currentTravel.visitedWaypoints.length;

    return length ?
      this.currentTravel.visitedWaypoints[length - 1] :
      this.currentTravel.origin;
  }

  get currentDestination(): PlaceModel {
    const length = this.currentTravel.pendingWaypoints.length;

    return length ?
      this.currentTravel.pendingWaypoints[0] :
      this.currentTravel.roundTrip ? this.currentTravel.origin : this.currentTravel.destination;

  }

  get nextDestination(): PlaceModel {
    const length = this.currentTravel.pendingWaypoints.length;

    return length > 1
      ? this.currentTravel.pendingWaypoints[1]
      : (length
        ? (this.currentTravel.roundTrip
          ? this.currentTravel.origin
          : this.currentTravel.destination)
        : null);
  }

  public restoreTravelWaypoints(travelId: number): Promise<boolean> {

    return this.getSynchronizeWaypoints(+this.identityService.carrierUserId, travelId)
      .then(routeWaypointsServer => {
        const useServerValues =
          !this.currentTravel.routeWaypoints
          || (this.currentTravel.routeWaypoints.length < routeWaypointsServer.route.length);
        const routeWaypoints =
          useServerValues
            ? routeWaypointsServer.route
            : this.currentTravel.routeWaypoints;

        if (this.currentTravel.waypoints &&
          routeWaypoints &&
          routeWaypoints.length > 1
        ) {
          // Obtain values of last item.
          const lastSegment = routeWaypoints[routeWaypoints.length - 1].segmentNumber;
          const lastPlace = routeWaypoints[routeWaypoints.length - 1].from;

          // Search index of lastPlace in travel>Waypoints.
          const indexOfLastPlace = this.currentTravel.waypoints.findIndex(
            w => w.id === lastPlace
          );

          // Si no encuentra el id en los waypoints, puede ser el origen.
          if (indexOfLastPlace === -1) {
            this.currentTravel.currentSegment = 1;
            this.currentTravel.pendingWaypoints = this.currentTravel.waypoints.slice();
            this.currentTravel.visitedWaypoints = [];
            return Promise.resolve(false);
          }

          const waypoints = this.currentTravel.waypoints.slice();
          const pendingWaypoints = waypoints.splice(indexOfLastPlace + 1);

          this.currentTravel.currentSegment = lastSegment;
          this.currentTravel.pendingWaypoints = pendingWaypoints;
          this.currentTravel.visitedWaypoints = waypoints;

          return Promise.resolve(true);
        } else {
          this.currentTravel.currentSegment = 1;
          this.currentTravel.visitedWaypoints = [];
          this.currentTravel.pendingWaypoints =
            this.currentTravel.waypoints ?
              this.currentTravel.waypoints.slice() :
              [];
          return Promise.resolve(false);
        }

      });

  }

  private initializeVitalValues() {

    // Final Destination.
    this.currentTravel.finalDestination =
      this.currentTravel.finalDestination
        ? this.currentTravel.finalDestination
        : new PlaceModel();

    // Travel Duration.
    this.currentTravel.travelDuration =
      this.currentTravel.travelDuration
        ? this.currentTravel.travelDuration
        : 0;

    // Wait Detail List.
    this.currentTravel.waitDetailList =
      this.currentTravel.waitDetailList
        ? this.currentTravel.waitDetailList
        : new Array<WaitDetailItemModel>();

    // Visited Waypoints.
    this.currentTravel.visitedWaypoints =
      this.currentTravel.visitedWaypoints
        ? this.currentTravel.visitedWaypoints
        : new Array<PlaceModel>();

    // Pending Waypoints.
    this.currentTravel.pendingWaypoints =
      this.currentTravel.pendingWaypoints
        ? this.currentTravel.pendingWaypoints
        : new Array<PlaceModel>();

    // Additional Stops.
    this.currentTravel.additionalStops =
      this.currentTravel.additionalStops
        ? this.currentTravel.additionalStops
        : 0;

    // Current Segment.
    this.currentTravel.currentSegment =
    this.currentTravel.currentSegment
      ? this.currentTravel.currentSegment
      : null;

      // Route Waypoints.
      this.currentTravel.routeWaypoints =
        this.currentTravel.routeWaypoints
          ? this.currentTravel.routeWaypoints
          : new Array<RouteWaypointModel>();

      // startTravelTime
      this.currentTravel.startTravelTime =
        this.currentTravel.startTravelTime
          ? this.currentTravel.startTravelTime
          : null;

      // currentSegment
      this.currentTravel.currentSegment =
        this.currentTravel.currentSegment
          ? this.currentTravel.currentSegment
          : 1;

      // initTimer
      this.currentTravel.initTimer =
        this.currentTravel.initTimer
          ? this.currentTravel.initTimer
          : null;


  }

  increaseCurrentSegment() {
    return this.currentTravel.currentSegment = this.currentTravel.visitedWaypoints.length + 1;
  }

  public updateTravelAudit(
    carrierUserId: number,
    travelId: number,
    travelAuditData: IUpdateTravelAuditCommandParameters,
  ): Promise<void> {
    let command = new UpdateTravelAuditCommand();
    command.setUrlParameters(carrierUserId, travelId);
    command.addCommandBody(travelAuditData);

    return this.connectionService
      .Request(command)
      .then(response => {
        return response;
      })
      .catch(error => {
        throw error;
      });
  }

   /**
   * Retorno -> unifica tiempo, dia, mes y año de la hora local del dispositivo y la proporcionada por el servidor.
   */
  getDatesDeviceAndTravel() {
    try {
      const deviceDate = new Date();
      const travelDate = new Date(this.currentTravel.travelDate);
      const timeDevice = deviceDate.getTime();
      const dayDevice = deviceDate.getDay();
      const monthDevice = deviceDate.getMonth();
      const yearDevice = deviceDate.getFullYear();

      const dayTravel = travelDate.getDay();
      const monthTravel = travelDate.getMonth();
      const yearTravel = travelDate.getFullYear();

      const travelFullDate = `${dayTravel}/${monthTravel}/${yearTravel}`;
      const deviceFullDate = `${dayDevice}/${monthDevice}/${yearDevice}`;

      return {
        timeDevice,
        dayDevice,
        monthDevice,
        yearDevice,
        dayTravel,
        monthTravel,
        yearTravel,
        travelFullDate,
        deviceFullDate,
      }
    } catch(error) {
      console.error('Error in getDatesDeviceAndTravel => ', error);
    }
  }

  /**
   * Trae la fecha completa local mas la fecha completa del viaje actual
   * para verificar si son iguales, Si coinciden devuelve true caso contrario retorna false.
   */
  validateIsDateNetwork(): boolean {
    const { travelFullDate, deviceFullDate } = this.getDatesDeviceAndTravel();
    return travelFullDate === deviceFullDate ? true : false;
  }

  async generateAuditInfo(): Promise<void> {
    let auditInfo: TravelAuditModel = new TravelAuditModel();
    try {
      auditInfo.driverId = +this.identityService.userId;
      auditInfo.vehicleId = +this.identityService.currentCarId;
      auditInfo.driverOsType = this.device.platform;
      auditInfo.driverOsVersion = this.device.version;
      auditInfo.driverPhoneModel = `${this.device.manufacturer} ${this.device.model}`;
      auditInfo.driverAppVersion = this.global.appVersion;
      auditInfo.driverAcceptTime = new Date();
      auditInfo.travelFinishTime = new Date();
      auditInfo.driverPlacesUpdate = false;

      const location = await this.navigationService.getCurrentBackgroundPosition();

      auditInfo.driverAcceptPosition = `{"lat":${location.coords.latitude},"lng":${location.coords.longitude}}`;
      auditInfo.driverDistanceToPax = this.distanceBetweenCoordinates(
        {latitude: location.coords.latitude, longitude: location.coords.longitude},
        {latitude: this.currentTravel.fromLat, longitude: this.currentTravel.fromLong}
      );
      console.log('AUDITORIA => ', auditInfo);
    } catch(error) {
      console.error('Error al guardar datos de auditoria', error);
    }

    this.currentTravel.auditInfo = auditInfo;
  }

  async startStreetTravel(carrierId: string, body: IStartStreetTravelCommandParameters): Promise<CurrentTravelModel> {
    /* Prepare request **/
    const commandStartStreetTravel = new StartStreetTravelCommand();
    commandStartStreetTravel.setCommandUrl(carrierId);
    commandStartStreetTravel.setCommandBody(body);
    /* Send request **/
    try {
      const response = await this.connectionService.Request(commandStartStreetTravel);
      return response;
    } catch (error) {
      throw error;
    }

  }

  /** HELPERS */
  distanceBetweenCoordinates(location1, location2): number {
    let result = -1;
    if(location1.latitude && location1.longitude && location2.latitude && location2.longitude) {
      const earthRadiusM = 6371000;

      const dLat = this.degreesToRadians(location2.latitude-location1.latitude);
      const dLon = this.degreesToRadians(location2.longitude-location1.longitude);

      const lat1 = this.degreesToRadians(location1.latitude);
      const lat2 = this.degreesToRadians(location2.latitude);

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      result = earthRadiusM * c;
    }

    return result;
  }

  degreesToRadians(degrees: number): number {
    return degrees * Math.PI / 180;
  }

  // Determines wich destination point to use in the travel
  // Returns the location tu use as destination
  // or null if there is no valid destination
  public destinationPointResolution(theoreticalDestination, lastRegisteredPoint ){
    let isTravelWithOpenDestination;
    // Determine if it is a travel with open destination
    if ( this.currentTravel.fromName == this.currentTravel.toName &&
      !this.currentTravel.roundTrip &&
      (!this.currentTravel.waypoints || this.currentTravel.waypoints.length === 0)
    ){
      isTravelWithOpenDestination = true;
    } else {
      isTravelWithOpenDestination = false;
    }

    // if travel is with open destination, return last registered point, if any
    if(isTravelWithOpenDestination){
      if(lastRegisteredPoint){
        return lastRegisteredPoint;
      } else {
        return null;
      }
    } else {
      // this travel has a theorical destination
      if(lastRegisteredPoint && theoreticalDestination){

        // convert locations to google LatLng for calculations
        const theoreticalDestinationCoords = new google.maps.LatLng(
          theoreticalDestination.latitude,
          theoreticalDestination.longitude
        )

        const lastRegisteredPointCoords = new google.maps.LatLng(
          lastRegisteredPoint.latitude,
          lastRegisteredPoint.longitude
        )

        // calculate distance between last registered point and theoretical destination
        this.navigationService.getLinearDistance([theoreticalDestinationCoords, lastRegisteredPointCoords])
        .then(distance => {
          if(distance < 1000){
            return lastRegisteredPoint;
          } else {
            return theoreticalDestination;
          }
        });

      } else {
        // We dont have any registered point, try to return the theoretical destination
        if(theoreticalDestination){
          return theoreticalDestination;
        } else {
          // We dont have any theoretical destination or registered point, return null
          return null;
        }
      }
    }
  }


}
