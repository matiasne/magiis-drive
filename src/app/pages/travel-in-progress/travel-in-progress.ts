import { WaitDetailItemModel } from './../../models/wait-detail-item.model';
import { Component, ChangeDetectorRef } from '@angular/core';

import { TravelService } from '../../services/travel.service';
import { NavigationService } from '../../services/navigation.service';
import { IdentityService } from '../../services/identity.service';
import { LoadingService } from '../../services/loading-service';
import { AlertsService } from '../../services/common/alerts.service';
import { TravelStatusEnum } from '../../services/enum/travelStatus';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { TranslateService } from '@ngx-translate/core';
import { TravelUpdate } from '../../models/travel-update.model';
import { Network } from '@awesome-cordova-plugins/network/ngx ';
import { StatusService } from '../../services/status.service';
import { LocalizationService } from '../../services/localization/localization.service';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { RouteWaypointModel } from '../../models/routeWaypoint.model';
import { Router,ActivatedRoute } from '@angular/router';
import { NavController, ModalController, Platform, MenuController, ModalOptions } from '@ionic/angular';

declare let google: any;


@Component({
  selector: 'app-page-travel-in-progress',
  templateUrl: 'travel-in-progress.html',
  styleUrls:['travel-in-progress.scss']
})
export class TravelInProgressPage {
  map: any;
  autoShowmap = false;
  showMapOnlyOnce = false;
  highlightAddresses = false;
  private endTravelTime: Date = new Date();

  //timer
  timerSeconds = 0;
  timerMinutes = 0;
  timerOn: boolean;
  timerHandle: NodeJS.Timeout;
  showDateNetworkAlert = true;
  carrierImage = '';

  travel: CurrentTravelModel = new CurrentTravelModel();
  travelWithOpenDestination: boolean;

  locationCount = 0;

  initCounter = false;

  /**Individual time for the current wait*/
  waitEndTime: Date;

  passengerImage: String;

  constructor(
    private navCtrl: NavController,
    private modalController: ModalController,
    private travelService: TravelService,
    private navigationService: NavigationService,
    private identityService: IdentityService,
    public events: Event,
    private loadingService: LoadingService,
    private alertService: AlertsService,
    private ref: ChangeDetectorRef,
    private platform: Platform,
    private storageService: StorageService,
    private menu: MenuController,
    private translateService: TranslateService,
     private network: Network,
    private statusService: StatusService,
    private localizationService: LocalizationService,
    private activitedRoute: ActivatedRoute,
    private openNativeSettings: OpenNativeSettings,
    private router: Router,
  ) {
    this.passengerImage = this.travelService.passengerImage;

    // Restore startTravelTime
    if (!this.travelService.currentTravel.startTravelTime) {
      this.travelService.currentTravel.startTravelTime = new Date();
      this.travelService.updateCurrentTravel();
    }

    if (!this.travelService.currentTravel.travelStatus) {
      this.travelService.currentTravel.travelStatus = <TravelStatusEnum>(<any>this.travelService.currentTravel).state;
      this.travelService.updateCurrentTravel();
    }

    this.showMapOnlyOnce = this.activitedRoute.snapshot.params['showMapOnlyOnce'];
  }

  isConnected(): boolean {
    const conntype = this.network.type;
    if (conntype == null) {
      //If the state can't be known, the de warning is not shown
      return true;
    } else {
      return conntype && conntype !== 'unknown' && conntype !== 'none';
    }
  }

  ionViewDidEnter() {
    this.locationCount = 0;

    this.travel = this.travelService.currentTravel;
    this.travelWithOpenDestination = (
      this.travel.fromName == this.travel.toName &&
      !this.travel.roundTrip &&
      (!this.travel.waypoints || this.travel.waypoints.length === 0)
    );

    this.checkHighlightAddresses();

    //bring timer from service
    this.timerMinutes = this.travelService.timerMinutes;
    this.timerSeconds = this.travelService.timerSeconds;

    //load carrier img
    this.carrierImage = this.identityService.getCarrierImage();

    this.platform.backButton.subscribe(() => {});
    this.initCounter = this.travelService.currentTravel.initTimer
      ? true
      : false;
    this.travelService.getTimerOn().then(res => {
      this.timerOn = res;
      this.setInitCounter();
    });

    this.loadDestination();
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  ionViewWillEnter() {
    this.travelService.isStreetPassengerTravel && this.travelService.generateAuditInfo();
    this.travelService.isStreetPassengerTravel = false;
    this.travelService.saveCurrentTravel();
    this.menu.enable(false);
    if (this.showMapOnlyOnce) {
      this.showMap();
    }

    //show map automatically depending on settings
    this.storageService
      .getData(StorageKeyEnum.autoShowMapOnTravel)
      .then(showmap => {
        this.autoShowmap = !!showmap;
      });
  }

  ngOnDestroy() {
    this.clearIntervals();
  }

  toggleTimer() {
    if(this.travelService.validateIsDateNetwork()) {
      this.timerOn = !this.timerOn;
      this.travelService.setTimerOn(this.timerOn);
      if (this.timerOn) {
        this.startTimer();
      } else {
        this.stopTimer();

        if (
          this.travelService.currentTravel.pendingWaypoints.length > 0
          //&& (!this.travelService.geocercaRatio || nav) // TODO: Se desactivo [Geofence] en parada porque al matar la app y volver a levantarla deja de funcionar.
          ) {
          this.nextDestinationDialog();
        } else {
          // addAdditionalStop
          this.travelService.currentTravel.additionalStops++;
        }

        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
        this.travelService.saveCurrentTravel();
      }
      this.travelService.timer(
        this.timerOn,
        this.travelService.currentWaitStartTime
      );
    } else {
      this.alertService.dialog(
        null,
        this.t('travel_in_progress.wrong_device_date_before_stop'),
        this.t('buttons.adjust_now'),
        null,
        async () => {
          await this.openNativeSettings.open('date');
          this.alertService.showingMessage = false;
        },
        null
      );
    }
  }

  private startTimer() {
    // Save new date when initTimer does not exist.
    if (!this.travelService.currentTravel.initTimer) {
      this.travelService.setInitTimer(new Date());
    }

    this.travelService.setCurrentWaitStartTime();
    this.setTimerHandle();
  }

  private stopTimer() {
    this.timerOn = false;
    this.travelService.setTimerOn(false);

    this.waitEndTime = new Date();
      this.travelService.setWaitEndTime(this.waitEndTime);
      const waitDetailItemModel = new WaitDetailItemModel(
        this.travelService.currentWaitStartTime,
        this.waitEndTime
      );

      if (this.travelService.currentTravel.waitDetailList == null) {
        this.travelService.currentTravel.waitDetailList = new Array<
          WaitDetailItemModel
        >();
      }

      this.travelService.currentTravel.waitDetailList.push(waitDetailItemModel);
      clearInterval(this.timerHandle);
      const nav = this.navigationService.inGeofence(this.travelService.currentDestination.id.toString());
      console.log('[Geofence]->pendigPoints', this.travelService.currentTravel.pendingWaypoints);
      console.log('[Geofence]->geocerca', this.travelService.geocercaRatio, !this.travelService.geocercaRatio );
      console.log('[Geofence]->nav', nav);
      console.log('[Geofence]->current.id',this.travelService.currentDestination.id.toString());
  }

  public finishTravelDialog() {
    const vm = this;
    const confirmAction = function() {
      vm.alertService.showingMessage = false;
      vm.finishTravel();
    };
    const cancelAction = function() {
      vm.alertService.showingMessage = false;
    };

    this.alertService.dialog(
      '',
      this.t('travel_in_progress.end_travel_message'),
      this.t('buttons.yes'),
      this.t('buttons.no'),
      confirmAction,
      cancelAction
    );
  }

  public viewAddress(addShortName: string){
       const addressWithoutProvince = addShortName.split(',');
       addressWithoutProvince.splice(addressWithoutProvince.length-2,2);
       const addressFinal = '<p><span class="bigAlert">'+addressWithoutProvince.join(',')+'</span></p>';
       return this.alertService.show('', addressFinal);
  }

  public async finalize(){
    this.travelService.currentTravel.travelStatus = TravelStatusEnum.travelResume;

    if(this.timerOn) {this.stopTimer();}
    this.endTravelTime = new Date();
    this.travelService.timer(false);
    clearInterval(this.timerHandle);

    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
    //this.navigationService.stopMoving();

    // Agrego la ultima parada si el contador no se pauso
    if (
      this.travelService.currentTravel.pendingWaypoints.length > 0
      //&& (!this.travelService.geocercaRatio || nav) // TODO: Se desactivo [Geofence] en parada porque al matar la app y volver a levantarla deja de funcionar.
      ) {
        this.travelService.currentTravel.visitedWaypoints.push(
          this.travelService.currentTravel.pendingWaypoints.shift()
        );

        this.travelService.currentTravel.currentSegment++;
        console.log('[Geofence]-addNextPoint', this.travelService.currentOrigin, this.travelService.currentDestination);

        this.travelService.setNextGeofence(
          this.travelService.currentOrigin.id.toString(),
          this.travelService.currentDestination.id.toString(),
          this.travelService.currentDestination
        );
    } else {
      // PR: Comento la linea de abajo porque no tiene sentido agregar una parada cuando no hay puntos pendientes de procesamiento.
      // this.travelService.currentTravel.additionalStops++;
    }

    this.loadingService.show(this.translateService.instant('travel_in_progress.purifying_waypoints'));

    this.travelService.currentTravel.useDistanceMatrix = this.navigationService.sanatizeWaypointsROSA();

    if (this.travelService.currentTravel.useDistanceMatrix) {
      //agregar los realVisitedWaypoints a this.travelService.currentTravel.sortedRouteWaypoints para luego ordenarlos por timeStamp
      const realWaypointsVisited = await this.storageService.getData(StorageKeyEnum.realVisitedWaypoint).then(realWaypoints => realWaypoints ? JSON.parse(realWaypoints) : []).catch(error => {console.log('error getting real visited waypoints', error);});

      const sortedRouteWaypoints = this.travelService.currentTravel.sortedRouteWaypoints;

      //Si el viaje es ida y vuelta se agregara tambien el dropOff al sortedRouteWaypoints
      if (this.travelService.currentTravel.roundTrip) {
        const dropOffPoint = await this.storageService.getData(StorageKeyEnum.dropOffPoint).then(dropOffPoint => dropOffPoint ? JSON.parse(dropOffPoint) : {}).catch(error => {console.log('error getting drop off point', error);});
        this.travelService.currentTravel.sortedRouteWaypoints = [...sortedRouteWaypoints, ...realWaypointsVisited, dropOffPoint];
      } else {
        this.travelService.currentTravel.sortedRouteWaypoints = [...sortedRouteWaypoints, ...realWaypointsVisited];
      }

      //Se re-ordenar el sortedRouteWaypoints por timeStamp
      this.navigationService.orderTransistorPointsByTimestamp();
    }

    this.loadingService.show();
    this.travelService.currentTravel.travelDuration = this.calculateTravelTime();
    this.travelService.currentTravel.travelLength = this.polylineDraw();
    this.travelService.currentTravel.roundTripLength = this.polylineDraw(this.travelService.getLastSegmentFromSortedRouteWaypoints());

    try {
      this.travelService.currentTravel.auditInfo.travelFinishTime = new Date();
    } catch(error) {
      console.error('Error in set travelFinishTime to finishTravel: ', error);
    }

    this.travelService.saveCurrentTravel();

    try {
      this.travelService.arriveToDestination(
        this.travelService.currentTravel.travelId,
        +this.identityService.carrierUserId
      );

    } catch(error) {
      console.error('Error call arriveToDestination to finishTravel: ', error);
    }

    this.loadingService.hide();

    if(this.travelService.currentTravel.affiliateSettings)
      {[this.router.navigate(['TravelTransferCostPage'])]}
    else
      {this.router.navigate(['TravelResumePage']);}
  }

  public finishTravel() {
    this.loadingService.show(this.translateService.instant('travel_in_progress.closing_travel'));

    //Guardo la ubicacion actual como punto de drop off
    this.navigationService.getActualPosition().then(location => {
      this.travelService.dropOffPoint = new RouteWaypointModel(
                                              {lat:location.coords.latitude,lng:location.coords.longitude},
                                              1,
                                              this.travelService.currentTravel.currentSegment,
                                              location.timestamp
                                            );

      this.travelService.saveDropOffPointToStorage(this.travelService.dropOffPoint);

      this.travelService.currentTravel.finalDestination.latitude = location.coords.latitude +'';
      this.travelService.currentTravel.finalDestination.longitude = location.coords.longitude +'';

      this.finalize();

    }).catch(error => {
      console.log('Error: No se pudo obtener la obicacion del GPS ' + error);
      let lastRecordedLocation;
      if(Array.isArray(this.travelService.currentTravel.routeWaypoints)){
        lastRecordedLocation = this.travelService.currentTravel.routeWaypoints[this.travelService.currentTravel.routeWaypoints.length - 1];
      } else {
        lastRecordedLocation = null;
      }
      const destination = this.travelService.destinationPointResolution(this.travelService.currentTravel.destination, this.travelService.currentOrigin);
      if(destination){
        this.travelService.currentTravel.finalDestination.latitude = destination.latitude;
        this.travelService.currentTravel.finalDestination.longitude = destination.longitude;
      }
      this.finalize();
    });
  }

  public editTravel() {
    if (!this.isConnected()) {
      return this.alertService.show('', this.t('connection_service.error_0'));
    }

    const options: ModalOptions = {
      cssClass: 'modal-edit-travel',
      componentProps: {
        showBackdrop: true,
        enableBackdropDismiss: false // Only dissmis with cancel button.
      },
      component: ''
    };
    if (this.identityService.isIPhoneXModel()) {
      options.cssClass = options.cssClass.concat(' platform-ios-x');
    }

    const modal = this.modalController.create('TravelEditComponent', {}, options);
    modal.present();
    modal.onDidDismiss((travel: TravelUpdate) => {
      if (!travel) {return;}

      if (!this.isConnected()) {
        return this.alertService.show('', this.t('connection_service.error_0'));
      }

      this.loadingService.show();
      this.travelService
        .updateTravel(travel, +this.identityService.carrierUserId)
        .then(() => this.statusService.getCurrentTripData(travel.id))
        .then((serverCurrentTrip: CurrentTravelModel) => {
          try {
            this.travelService.currentTravel.auditInfo.driverPlacesUpdate = true;
          } catch(error) {
            console.log('Error al guardar datos de auditoria');
            console.error(error);
          }

          this.travelService.mergeUpdatedTravel(serverCurrentTrip);
          this.travel = this.travelService.currentTravel;
          this.travelWithOpenDestination = (
            this.travel.fromName == this.travel.toName &&
            !this.travel.roundTrip &&
            (!this.travel.waypoints || this.travel.waypoints.length === 0)
          );

          /*if(this.travel.pendingWaypoints.length > 0)
            this.newDestinationDialog();*/
          this.loadingService.hide();
        })
        .catch(error => {
          this.loadingService.hide();
          if (error.status === 0) {
            this.travelService.showLostConectionMessage = true;
          } else {
            this.alertService.show(
              this.t('travel_in_progress.travel_edit_alert_title'),
              this.t('travel_in_progress.travel_edit_alert_body')
            );
          }
        });
    });
  }

  //Tiempo del viaje en Minutos
  private calculateTravelTime() {
    let diff =
      (this.travelService.currentTravel.startTravelTime.getTime() -
        this.endTravelTime.getTime()) /
      1000;
    diff /= 60;
    return Math.abs(Math.round(diff));
  }

  private checkHighlightAddresses() {
    this.storageService.getData(StorageKeyEnum.highlightAddresses)
      .then(highlight => {
        this.highlightAddresses = !!highlight;
      });
  }

  public showMap() {
    this.loadingService.show();

    if (this.platform.is('ios'))
      {this.travelService.navigateToDestination('ios');}
    else if (this.platform.is('android'))
      {this.travelService.navigateToDestination('android');}

    this.loadingService.hide();
  }

  private polylineDraw(inRouteWaypointsArray?: google.maps.LatLng[]) {
    let wps: google.maps.LatLng[];
    try {
      wps = (inRouteWaypointsArray) ? inRouteWaypointsArray
             : this.travelService.currentTravel.sortedRouteWaypoints.map(r=>new google.maps.LatLng( r.location.lat, r.location.lng) );
    } catch (error) {
      wps=null;
    }

    if (
      wps != null && wps.length > 0
    ) {
      const flightPath = new google.maps.Polyline({
        path: wps,
        geodesic: true,
        strokeColor: '#6495ED',
        strokeOpacity: 1.0,
        strokeWeight: 8
      });

      const metres = google.maps.geometry.spherical.computeLength(
        flightPath.getPath()
      );
      return Math.abs(Math.round((metres / 100) * 10) / 100);
    } else {
      return 0;
    }
  }

  private setTimerHandle(): void {
    this.timerHandle = setInterval(() => {
      this.timerMinutes = this.travelService.timerMinutes;
      this.timerSeconds = this.travelService.timerSeconds;
      this.validateTimerHandle();
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    }, 1000);
  }

  private clearIntervals(): void {
    clearInterval(this.timerHandle);
    clearInterval(this.travelService.timerHandle);
  }

  /**
   * If the counter was started at least once, it restores its status.
   */
  private setInitCounter(): void {
    this.clearIntervals();
    const initTimer = this.travelService.currentTravel.initTimer;
    if (initTimer) {
      if (this.timerOn) {
        const timeElapsed: number = this.calculateTimeElapsed();
        if (timeElapsed < 1) {
          // Not found waitDetailItem.
          this.travelService.timerTicks = 0;
          this.travelService.timer(
            this.timerOn,
            this.travelService.currentWaitStartTime
          );
        } else {
          this.travelService.timerTicks = timeElapsed;
          this.travelService.timer(
            this.timerOn,
            this.travelService.currentWaitStartTime
          );
        }
        this.setTimerHandle();
      } else {
        this.travelService.getWaitEndTime().then(endTime => {
          if (endTime) {
            const timeElapsed = this.calculateTimeElapsed();
            this.travelService.timerTicks = timeElapsed;
            this.timerMinutes = Math.floor(timeElapsed / 60);
            this.timerSeconds = timeElapsed - this.timerMinutes * 60;
            this.travelService.setMinutesAndSeconds(
              this.timerMinutes,
              this.timerSeconds
            );
          }
        });
      }
    }
  }

  private calculateTimeElapsed(): number {
    const waitDetail: Array<WaitDetailItemModel> = this.travelService
      .currentTravel.waitDetailList;
    let timeElapsed = 0;
    if (waitDetail.length > 0) {
      //Tengo tiempo de posta
      waitDetail.forEach(item => {
        const startDate: Date = new Date(item.startDate);
        const endDate: Date = new Date(item.endDate);
        timeElapsed =
          timeElapsed +
          Math.floor((endDate.getTime() - startDate.getTime()) / 1000);
      });
    }
    return timeElapsed;
  }

  private async nextDestinationDialog() {
    const nextDestinationModal = this.modalController
      .create(
        'TravelNextDestinationModal',
        { showMap: this.autoShowmap},
        {
          cssClass: 'popUp-Modal modalNextDestination',
          showBackdrop: true,
          enableBackdropDismiss: false // Only dissmis with cancel button.
        }
      );
    nextDestinationModal.onDidDismiss((data) => {
      this.refreshCurrentTravel();
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
    return await nextDestinationModal.present();
  }

 /* private async newDestinationDialog() {
    let newDestinationModal = this.modalController
      .create(
        'TravelNewDestinationModal',
        { showMap: this.autoShowmap},
        {
          cssClass: 'popUp-Modal modalNextDestination',
          showBackdrop: true,
          enableBackdropDismiss: false // Only dissmis with cancel button.
        }
      );
      newDestinationModal.onDidDismiss((data) => {
      this.refreshCurrentTravel();
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
    return await newDestinationModal.present();
  }*/

  private loadDestination() {
    this.navigationService.startMoving();
    console.log('[Geofence] - load Destination (travel-in-progress.ts)', this.travelService.currentDestination);
    this.navigationService.addGeofence(
      this.travelService.currentDestination.id.toString(),
      this.travelService.currentDestination,
      this.travelService.geocercaRatio
    );

    this.refreshCurrentTravel(); // Update travel instance.
  }

  private refreshCurrentTravel() {
    this.travel = this.travelService.currentTravel;
  }

  getCurrencySymbol() {
    return this.localizationService.localeData
      ? this.localizationService.localeData.currency.symbol
      : '$';
  }

  private validateTimerHandle(): void {
    const { dayDevice, dayTravel, monthTravel, monthDevice, yearTravel, yearDevice } = this.travelService.getDatesDeviceAndTravel();

    /* Compara si la hora local del dispositivo es mayor o menor a la del servidor. **/
    const isOlder = (dayDevice > dayTravel || monthTravel > monthDevice || yearTravel > yearDevice);
    const isMinor = (dayDevice < dayTravel || monthTravel < monthDevice || yearTravel < yearDevice);

    if( (isOlder || isMinor) && this.showDateNetworkAlert ) {
       this.alertService.dialog(
        null,
        this.t('travel_in_progress.wrong_device_date'),
        this.t('buttons.adjust_now'),
        null,
        async () => {
          await this.openNativeSettings.open('date');
          this.alertService.showingMessage = false;
          this.showDateNetworkAlert = true;
        },
        null
      );
      this.showDateNetworkAlert = false;
    }
  }
}
