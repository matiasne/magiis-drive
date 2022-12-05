import { TranslateService } from '@ngx-translate/core';
import { Location as TransistorLocation } from 'cordova-background-geolocation';
import { Subject } from 'rxjs';
import { PopPictureComponent } from '../../components/pop-picture/pop-picture';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { Location } from '../../models/location.model';
import { OtherCostDetailItemModel } from '../../models/other-cost-detail-item.model';
import { ParkingDetailItemModel } from '../../models/parking-detail-item.model';
import { TollDetailItemModel } from '../../models/toll-detail-item.model';
import { TravelAffiliateSettingsModel } from '../../models/travel-affiliate-settings.model';
import { TravelTotalDetailedCostModel } from '../../models/travel-total-detailed-cost.model';
import { AlertsService } from '../../services/common/alerts.service';
import { RateEngineService } from '../../services/engines/rateEngine.service';
import { PaymentMethodValueEnum } from '../../services/enum/paymentMethod';
import { LoadingService } from '../../services/loading-service';
import { LocalizationService } from '../../services/localization/localization.service';
import { NavigationService } from '../../services/navigation.service';
import { StatusService } from '../../services/status.service';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';
import { TravelService } from '../../services/travel.service';
import { IReducedMatrix } from '../travel-resume/IReducedMatrix';
import { takeUntil } from 'rxjs/operators';
import { ModalController, NavController, Platform } from '@ionic/angular';
import { TravelAddTollModal } from '../travel-add-toll/travel-add-toll';
import { TravelAddParkingModal } from '../travel-add-parking/travel-add-parking';
import { TravelAddOtherCostModal } from '../travel-add-other/travel-add-other';
import { Router } from '@angular/router';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { Network } from '@awesome-cordova-plugins/network/ngx';

declare let google: any;

@Component({
  selector: 'app-travel-transfer-cost',
  templateUrl: 'travel-transfer-cost.html',
  styleUrls: ['travel-transfer-cost.scss'],
 /* animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],*/
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelTransferCostPage {
  destroy$: Subject<boolean> = new Subject<boolean>();
  @ViewChild(PopPictureComponent) popPicture: PopPictureComponent;

  travel: CurrentTravelModel;
  travelAffiliateSettings: TravelAffiliateSettingsModel;
  finalDestination: Location;
  affiliateFinalPrices: {
    total: number;
    subtotal: number;
    waitTime: number;
    waypoints: number;
    paxPrice: number;
    extraCosts: {
      other: {
        expense: number;
        list: OtherCostDetailItemModel[];
      };
      parking: {
        expense: number;
        list: ParkingDetailItemModel[];
      };
      toll: {
        expense: number;
        list: TollDetailItemModel[];
      };
    };
  };
  highlightAddresses: boolean;
  paymentMethod: PaymentMethodValueEnum;

  constructor(
    private travelService: TravelService,
    private storageService: StorageService,
    private alertService: AlertsService,
    private navigationService: NavigationService,
    private rateEngine: RateEngineService,
    private statusService: StatusService,
    private modalCtrl: ModalController,
    private loadingService: LoadingService,
    private localizationService: LocalizationService,
    private navCtrl: NavController,
    private translateService: TranslateService,
    private network: Network,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    private router:Router
  ) {
    this.travel = this.travelService.currentTravel;
    this.travelAffiliateSettings = this.travelService.currentTravel.affiliateSettings;
    this.paymentMethod = this.travelService.currentTravel.paymentMethod as PaymentMethodValueEnum;
    this.affiliateFinalPrices = {
      total: this.travelAffiliateSettings.type === 'ONE_SHOT' ? this.travelAffiliateSettings.oneShotRules.travelCostWithMarkup : this.travelService.currentTravel.cost,
      subtotal: this.travelAffiliateSettings.type === 'ONE_SHOT' ? this.travelAffiliateSettings.oneShotRules.travelCostWithMarkup : this.travelService.currentTravel.cost,
      waitTime: 0,
      waypoints: 0,
      paxPrice: this.travelAffiliateSettings.type === 'ONE_SHOT' ? this.travelAffiliateSettings.oneShotRules.travelCostWithMarkup : this.travelService.currentTravel.cost,
      extraCosts: {
        other: {
          expense: 0,
          list: []
        },
        parking: {
          expense: 0,
          list: []
        },
        toll: {
          expense: 0,
          list: []
        }
      }
    };
  }

  ionViewDidEnter() {
    this.checkHighlightAddresses();
    this.setWaitMinutes();
    this.handleExtraCostsChanges();
    this.getFinalDestination().then(location => {
      this.finalDestination = location;
      this.getTravelDistance();
    });
    this.platform.backButton.subscribe(() => {});
  }

  ionViewDidLeave() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  private async getTravelDistance(): Promise<void> {
    const isRoundTrip = this.travelService.currentTravel.roundTrip;
    const estimatedDistance = this.travelService.currentTravel.km * 1000;
    const originLocation = new google.maps.LatLng(+this.travelService.currentTravel.fromLat, +this.travelService.currentTravel.fromLong);
    const waypoints = this.travelService.getWaypointsAsLatLng();
    const distance = await this.navigationService.getLinearDistance([originLocation, ...waypoints]);
    const lastSegmentDistance = isRoundTrip ? await this.navigationService.getLinearDistance(this.travelService.getLastSegmentWaypointsAsLatLng()) : 0;

    if(this.travelHasNecessaryWaypoints(waypoints, estimatedDistance)) {
      console.info(`Puntos necesarios alcanzados, se procesa distancia con ${waypoints.length} puntos.`);
      this.resolveRealDistance(distance, lastSegmentDistance);
    } else if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
      // El viaje no tiene paradas intermedias
      if(
        (this.travelService.currentTravel.waypoints == null || this.travelService.currentTravel.waypoints.length == 0) &&
        !this.travelService.currentTravel.roundTrip
      ) {
        console.info(`
          Puntos necesarios no alcanzados, se procesa distancia con ${waypoints.length} puntos (sin paradas intermedias ni ida y vuelta).
        `);
        this.getDistanceMatrix(originLocation, waypoints).then((distance: number) => {
          if(distance) {this.resolveRealDistance(distance, lastSegmentDistance);}
          else {this.setOriginalDestination();}
        });
      } else {
        // El viaje tiene paradas intermedias
        console.info(`
          Puntos necesarios no alcanzados, se procesa distancia estimada (con paradas intermedias y/o ida y vuelta).
        `);
        this.resolveRealDistance(estimatedDistance, lastSegmentDistance);
      }
    } else {
      console.info(`
        Puntos necesarios no alcanzados y conexión a internet nula. Se procesa distancia estimada.
      `);
      this.resolveRealDistance(estimatedDistance, lastSegmentDistance);
    }
  }

  private resolveRealDistance(distance: number, roundTripDistance: number) {
    const tolerancePercent: number = this.travelAffiliateSettings.oneShotRules ?
      this.travelAffiliateSettings.oneShotRules.tolerancePercent :
      this.travelService.currentTravel.endTolerancePercent;
    const toleranceRadius = (tolerancePercent * this.travelService.currentTravel.km) / 100;
    const Xmin = this.travelService.currentTravel.km - toleranceRadius;
    const Xmax = this.travelService.currentTravel.km + toleranceRadius;

    this.travelService.currentTravel.travelLength = distance / 1000;
    this.travelService.currentTravel.roundTripLength = this.travelService.currentTravel.roundTrip ? roundTripDistance / 1000 : 0;

    if(
      this.travelService.currentTravel.travelLength >= Xmin &&
      this.travelService.currentTravel.travelLength <= Xmax
    ) {
      console.log('Distancia final dentro de % de tolerancia.');
      // Use originally simulated distance
      this.setOriginalDestination();
    } else {
      console.log('Distancia fuera de % de tolerancia.');
      // Use new real distance
      this.travelService.currentTravel.finalDestination.latitude = this.finalDestination.lat.toString();
      this.travelService.currentTravel.finalDestination.longitude = this.finalDestination.lng.toString();
      this.recalculateDestination(
        +this.finalDestination.lat,
        +this.finalDestination.lng
      );
    }
    this.ref.markForCheck();
  };

  private recalculateDestination(latitude: number, longitude: number) {
    this.loadingService.show(this.translateService.instant('travel_resume.dialogs.calculating_cost'));
    let recalculating = true;

    this.setLocationShortName(latitude, longitude);

    const realDistance = this.travelService.currentTravel.travelLength;
    this.travelService.currentTravel.finalDistance = realDistance;
    this.travelService.currentTravel.finalDistanceReturnTrip = this.travelService.currentTravel.roundTripLength;
    this.travelService.currentTravel.lapDistance = this.statusService.getNeareastBaseDistance(new google.maps.LatLng(+latitude, +longitude)) / 1000;

    // Hide loading after 15 secs
    setTimeout(() => {
      if(recalculating) {
        this.loadingService.hide();
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      }
    }, 15 * 1000);

    this.calculateCost();
    recalculating = false;
    this.loadingService.hide();
  }

  private setOriginalDestination() {
    this.loadingService.show(this.translateService.instant('travel_resume.dialogs.calculating_cost'));

    if(this.finalDestination.lat && this.finalDestination.lng)
      {this.setLocationShortName(this.finalDestination.lat, this.finalDestination.lng);}
    else
      {this.travelService.currentTravel.finalDestination.shortName = this.travelService.currentTravel.toName;}
    this.travelService.currentTravel.finalDestination.latitude = this.finalDestination.lat.toString();
    this.travelService.currentTravel.finalDestination.longitude = this.finalDestination.lng.toString();
    this.travelService.currentTravel.finalDistance = this.travelService.currentTravel.km;
    this.travelService.currentTravel.travelLength = this.travelService.currentTravel.km;

    if(this.travelService.currentTravel.roundTrip) {
      this.travelService.currentTravel.roundTripLength = this.travelService.currentTravel.lastWaypointsDistance;
      this.travelService.currentTravel.finalDistanceReturnTrip = this.travelService.currentTravel.lastWaypointsDistance;
    } else {
      this.travelService.currentTravel.roundTripLength = 0;
      this.travelService.currentTravel.finalDistanceReturnTrip = 0;
    }

    this.calculateCost();
  }

  calculateCost() {
    const affiliateTravelType = this.travelAffiliateSettings.type;

    this.affiliateFinalPrices.extraCosts.toll.expense = this.calculatePriceToll();
    this.affiliateFinalPrices.extraCosts.parking.expense = this.calculatePriceParking();
    this.affiliateFinalPrices.extraCosts.other.expense = this.calculatePriceOtherCost();

    switch(affiliateTravelType) {
      case 'ONE_SHOT':
        this.calculateCostOneShot();
        break;
      case 'ATC':
        this.calculateCostATC();
        break;
    }

    this.loadingService.hide();
  }

  calculateCostOneShot() {
    const oneShotRules = this.travelAffiliateSettings.oneShotRules;
    const toleranceDistance = this.travelService.currentTravel.km * (oneShotRules.tolerancePercent / 100);
    const excessDistance = (this.travelService.currentTravel.travelLength - this.travelService.currentTravel.km) - toleranceDistance;
    const additionalStops = this.travelService.currentTravel.additionalStops;
    const excessWaitTime = this.travelService.currentTravel.waitMinutes - oneShotRules.includedWaitTime;

    this.affiliateFinalPrices = {
      total: this.travelAffiliateSettings.oneShotRules.amount,
      subtotal: this.travelAffiliateSettings.oneShotRules.amount,
      paxPrice: this.travelAffiliateSettings.oneShotRules.travelCostWithMarkup,
      waitTime: 0,
      waypoints: 0,
      extraCosts: this.affiliateFinalPrices.extraCosts
    };

    if(excessDistance > 0) {
      this.affiliateFinalPrices.total += excessDistance * oneShotRules.extraKmValue;
      this.affiliateFinalPrices.subtotal += excessDistance * oneShotRules.extraKmValue;
    }
    if(additionalStops > 0) {
      this.affiliateFinalPrices.total += oneShotRules.extraWaypointValue * this.travelService.currentTravel.additionalStops;
      this.affiliateFinalPrices.subtotal += oneShotRules.extraWaypointValue * this.travelService.currentTravel.additionalStops;
    }
    if(excessWaitTime > 0) {
      this.affiliateFinalPrices.total += excessWaitTime * (oneShotRules.extraWaitTimeValue / 60);
      this.affiliateFinalPrices.waitTime += excessWaitTime * (oneShotRules.extraWaitTimeValue / 60);
    }
    if(!oneShotRules.includeToll)
      {this.affiliateFinalPrices.total += this.calculatePriceToll();}
    if(!oneShotRules.includeParking)
      {this.affiliateFinalPrices.total += this.calculatePriceParking();}
    if(!oneShotRules.includeOther)
      {this.affiliateFinalPrices.total += this.calculatePriceOtherCost();}

    this.affiliateFinalPrices.total = Math.round(this.affiliateFinalPrices.total);

    this.travelService.currentTravel.transferCost = this.affiliateFinalPrices.subtotal;
    this.travelService.currentTravel.totalTransferCost = this.affiliateFinalPrices.total;
    this.travelService.saveCurrentTravel();
  }

  calculateCostATC() {
    console.info('ATC: CalculateCostATC: Entro');
    this.travelService.currentTravel.priceWaitTime =
      this.travelService.currentTravel.rental
      ? 0
      : this.travelService.currentTravel.priceWaitTime;
    const waitMinutes =
      this.travelService.currentTravel.waitMinutes == null || this.travelService.currentTravel.rental
      ? 0
      : this.travelService.currentTravel.waitMinutes;
    const priceToll = this.calculatePriceToll();
    const priceParking = this.calculatePriceParking();
    const priceOtherCost = this.calculatePriceOtherCost();
    const additionalStops =
      this.travelService.currentTravel.additionalStops == null || this.travelService.currentTravel.rental
      ? 0
      : this.travelService.currentTravel.additionalStops;


    // If next destination is not the travel's origin
    if(this.travelService.currentDestination.id != this.travelService.currentTravel.origin.id) {
      this.travelService.currentTravel.roundTripLength = 0;
      this.travelService.currentTravel.roundTrip = false;
    }

    console.info('ATC: CalculateCostATC: datos', this.travelService.currentTravel.finalDistance,this.travelService.currentTravel.finalDistanceReturnTrip,
    this.travelService.currentTravel.affiliateSettings.pricePerKm,
    priceToll,
    priceParking,
    priceOtherCost,
    additionalStops,
    waitMinutes,
    PaymentMethodValueEnum.CASH,
    this.travelService.currentTravel.roundTrip,
    this.travelService.currentTravel.km,
    this.travelService.currentTravel.lastWaypointsDistance,
    this.travelService.currentTravel.endTolerancePercent,
    this.travelService.currentTravel.rental,
    this.travelService.currentTravel.rentHours,
    this.travelService.currentTravel.rentType,
    this.travelService.currentTravel.travelDuration,
    this.travelService.currentTravel.taxiingDistance,
    this.travelService.currentTravel.lapDistance,
    this.travelService.currentTravel.taxiingAdjustmentCoeff);

    const totalDetailedCosts: TravelTotalDetailedCostModel = this.rateEngine.calculateTravelCost(
      this.travelService.currentTravel.finalDistance,
      this.travelService.currentTravel.finalDistanceReturnTrip,
      this.travelService.currentTravel.affiliateSettings.pricePerKm,
      priceToll,
      priceParking,
      priceOtherCost,
      additionalStops,
      waitMinutes,
      PaymentMethodValueEnum.CASH,
      this.travelService.currentTravel.roundTrip,
      this.travelService.currentTravel.km,
      this.travelService.currentTravel.lastWaypointsDistance,
      this.travelService.currentTravel.endTolerancePercent,
      this.travelService.currentTravel.rental,
      this.travelService.currentTravel.rentHours,
      this.travelService.currentTravel.rentType,
      this.travelService.currentTravel.travelDuration,
      this.travelService.currentTravel.taxiingDistance,
      this.travelService.currentTravel.lapDistance,
      this.travelService.currentTravel.taxiingAdjustmentCoeff,
      this.travelService.currentTravel.affiliateSettings.atcRules
    );

    this.affiliateFinalPrices = {
      total: totalDetailedCosts.totalCostFinal,
      subtotal: (
        totalDetailedCosts.totalCostFinal -
        priceToll -
        priceParking -
        priceOtherCost -
        totalDetailedCosts.waitTimePrice
      ),
      paxPrice: this.travel.cost,
      waitTime: totalDetailedCosts.waitTimePrice,
      waypoints: 0,
      extraCosts: this.affiliateFinalPrices.extraCosts
    };

    this.travelService.currentTravel.transferCost = this.affiliateFinalPrices.subtotal;
    this.travelService.currentTravel.totalTransferCost = this.affiliateFinalPrices.total;
    this.travelService.saveCurrentTravel();

    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  continueToResume() {
    this.router.navigate(['TravelResumePage']);
  }

  private handleExtraCostsChanges() {
    this.travelService.otherCostList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.other.list = res;
      this.ref.markForCheck();
    });
    this.travelService.otherCostExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.other.expense = res;
      this.ref.markForCheck();
    });

    this.travelService.parkingList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.parking.list = res;
      this.ref.markForCheck();
    });
    this.travelService.parkingExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.parking.expense = res;
      this.ref.markForCheck();
    });

    this.travelService.tollList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.toll.list = res;
      this.ref.markForCheck();
    });
    this.travelService.tollExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.affiliateFinalPrices.extraCosts.toll.expense = res;
      this.ref.markForCheck();
    });
  }

  public calculatePriceToll(): number {
    let priceToll = 0;
    const tollList: Array<TollDetailItemModel> = this.travelService.currentTravel.tollList;

    if(tollList && tollList.length > 0) {
      tollList.forEach(tollItem => {
        priceToll += tollItem.price;
      });
    }
    this.ref.markForCheck();

    return priceToll;
  }

  public calculatePriceParking(): number {
    let priceParking = 0;
    const parkingList: Array<ParkingDetailItemModel> = this.travelService.currentTravel.parkingList;

    if(parkingList && parkingList.length > 0) {
      parkingList.forEach(parkingItem => {
        priceParking += parkingItem.price;
      });
    }
    this.ref.markForCheck();

    return priceParking;
  }

  public calculatePriceOtherCost(): number {
    let priceOtherCost = 0;
    const otherCostList: Array<OtherCostDetailItemModel> = this.travelService.currentTravel.otherCostList;

    if(otherCostList && otherCostList.length > 0) {
      otherCostList.forEach(otherCostItem => {
        priceOtherCost += otherCostItem.price;
      });
    }
    this.ref.markForCheck();

    return priceOtherCost;
  }

  private async getDistanceMatrix(originLocation: google.maps.LatLng, waypoints: google.maps.LatLng[]): Promise<number> {
    try {
      if(!google) {throw 'Error al cargar libreria de Google';}
      const service = new google.maps.DistanceMatrixService();
      let matrixWaypoints: google.maps.LatLng[] = [];

      if(waypoints.length >= 23) {
        const splitLength = Math.ceil(waypoints.length / 23);
        let index = 0;
        while(index < waypoints.length) {
          matrixWaypoints.push(waypoints.slice(index, splitLength + index)[0]);
          index += splitLength;
        }
      } else {
        matrixWaypoints = waypoints;
      }

      return new Promise<number>(async resolve => {
        await service.getDistanceMatrix({
          origins: [originLocation],
          destinations: matrixWaypoints,
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false
        }, (
          response: google.maps.DistanceMatrixResponse,
          status: google.maps.DistanceMatrixStatus
        ) => {
          if(status != google.maps.DistanceMatrixStatus.OK)
            {resolve(null);}

          console.log('REDUCE MATRIX', this.reduceMatrix(response).distance);
          resolve(this.reduceMatrix(response).distance);
        });
      });
    } catch(error) {
      console.error(error);
      return null;
    }
  }

  private reduceMatrix(matrix: google.maps.DistanceMatrixResponse): IReducedMatrix {
    const initial: IReducedMatrix = { distance: 0, duration: 0 };
    return matrix.rows[0].elements.reduce(
      (r, a) => ({
        distance: r.distance + (a.distance.value - r.distance),
        duration: r.duration + (a.duration.value - r.duration)
      }),
      initial
    );
  }

  private async getFinalDestination(): Promise<Location> {
    let finalDestinationCoords: Location;

    this.alertService.clear();
    this.loadingService.show(this.translateService.instant('travel_resume.loading_location'));

    // Final destination not saved
    if(
      !this.travelService.currentTravel.finalDestination.latitude ||
      !this.travelService.currentTravel.finalDestination.longitude
    ) {
      console.log('Punto de cierre de viaje no asignado... asignando localización actual.');
      await this.navigationService
        .getCurrentBackgroundPosition()
        .then((location: TransistorLocation) => {
          console.log('BackgroundGeolocation.getCurrentPosition:', location);
          finalDestinationCoords = {
            lat: location.coords.latitude,
            lng: location.coords.longitude
          };
          this.travelService.setWaypoint(finalDestinationCoords.lat, finalDestinationCoords.lng, location.timestamp);
        })
        .catch(error => {
          console.error('BackgroundGeolocation.getCurrentPosition:', error);
          // If there are recorded waypoints, take the last one
          if(this.travelService.currentTravel.routeWaypoints.length > 0) {
            const waypoints = this.travelService.currentTravel.routeWaypoints;
            finalDestinationCoords = {
              lat: +waypoints[waypoints.length - 1].location.lat,
              lng: +waypoints[waypoints.length - 1].location.lng
            };
          } else {
            // If there are not recorded waypoints
            finalDestinationCoords = {
              lat: +this.travelService.currentTravel.toLat,
              lng: +this.travelService.currentTravel.toLong
            };
          }
        });
    } else {
      console.log('Punto de cierre de viaje ya asignado.', this.travelService.currentTravel.finalDestination);
      finalDestinationCoords = {
        lat: +this.travelService.currentTravel.finalDestination.latitude,
        lng: +this.travelService.currentTravel.finalDestination.longitude
      };
    }

    return finalDestinationCoords;
  }

  async addNewToll() {

      const tollModal = await this.modalCtrl.create({
        component: TravelAddTollModal,
        cssClass: 'popUp-Modal modalToll',
      });

      tollModal.onDidDismiss().then((data: any) => {
        if(data) {
          this.loadingService.show(this.translateService.instant('travel_resume.dialogs.update_travel'));
          this.travelService.saveNewToll(data);
          this.calculateCost();
          setTimeout(() => {
            this.loadingService.hide();
            this.ref.markForCheck();
          }, 1000);
        }
      })

      return await tollModal.present();

    }


  async addNewParking() {
    const parkingModal = await this.modalCtrl.create({
      component: TravelAddParkingModal,
      cssClass: 'popUp-Modal modalParking',
    });

    parkingModal.onDidDismiss().then((data: any) => {
      if(data) {
        this.loadingService.show(this.translateService.instant('travel_resume.dialogs.update_travel'));
        this.travelService.saveNewToll(data);
        this.calculateCost();
        setTimeout(() => {
          this.loadingService.hide();
          this.ref.markForCheck();
        }, 1000);
      }
    });

    return await parkingModal.present();
  }

  async addOtherCost() {
    const otherCostModal = await this.modalCtrl.create({
      component: TravelAddOtherCostModal,
      cssClass: 'popUp-Modal modalOther',
    });

    otherCostModal.onDidDismiss().then((data: any) => {
      if(data) {
        this.loadingService.show(this.translateService.instant('travel_resume.dialogs.update_travel'));
        this.travelService.saveNewToll(data);
        this.calculateCost();
        setTimeout(() => {
          this.loadingService.hide();
          this.ref.markForCheck();
        }, 1000);
      }
    });

    return await otherCostModal.present();
  }

   removeTollItem(item: TollDetailItemModel, index: number) {
    const that = this;
    const cancelAction = () => {
      that.alertService.showingMessage = false;
    };
    const confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeTollItem(index);
      this.calculateCost();
      this.ref.markForCheck();
      this.loadingService.hide();
    };

    this.alertService.dialog(
      this.translateService.instant('travel_resume.dialogs.delete_toll'),
      this.translateService.instant('travel_resume.dialogs.question_delete', { value: item.name }),
      this.translateService.instant('travel_resume.dialogs.accept'),
      this.translateService.instant('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  removeParkingItem(item: ParkingDetailItemModel, index: number) {
    const that = this;
    const cancelAction = () => {
      that.alertService.showingMessage = false;
    };
    const confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeParkingItem(index);
      this.calculateCost();
      this.ref.markForCheck();
      this.loadingService.hide();
    };

    this.alertService.dialog(
      this.translateService.instant('travel_resume.dialogs.delete_parking'),
      this.translateService.instant('travel_resume.dialogs.question_delete', { value: item.name }),
      this.translateService.instant('travel_resume.dialogs.accept'),
      this.translateService.instant('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  removeOtherCostItem(item: OtherCostDetailItemModel, index: number) {
    const that = this;
    const cancelAction = () => {
      that.alertService.showingMessage = false;
    };
    const confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeOtherCostItem(index);
      this.calculateCost();
      this.ref.markForCheck();
      this.loadingService.hide();
    };

    this.alertService.dialog(
      this.translateService.instant('travel_resume.dialogs.delete_other_cost'),
      this.translateService.instant('travel_resume.dialogs.question_delete', { value: item.name }),
      this.translateService.instant('travel_resume.dialogs.accept'),
      this.translateService.instant('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  showTicket(item: TollDetailItemModel | ParkingDetailItemModel): void {
    if (item.image) {
      const picture = item.image;
      const caption = `${item.name} $${item.price}`;
      this.popPicture.open(picture, caption);
    }
  }

  private travelHasNecessaryWaypoints(waypoints: google.maps.LatLng[], estimatedDistance: number) {
    // The first number represents the required percentage. Ex. 1%.
    const distanceCoefficient = 1 / 100;

    return waypoints.length >= ~~((estimatedDistance) * distanceCoefficient);
  }

  setLocationShortName(latitude: number, longitude: number) {
    const thisClass = this;

    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
      const geocoder = new google.maps.Geocoder();
      const request = {
        latLng: new google.maps.LatLng(latitude.toString(), longitude.toString())
      };

      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0] != null) {
            thisClass.travelService.currentTravel.finalDestination.shortName =
              results[0].formatted_address;
            if (!thisClass.ref['destroyed']) {
              thisClass.ref.detectChanges();
            }
          } else {
            thisClass.travelService.currentTravel.finalDestination.shortName = 'N/D';
            if (!thisClass.ref['destroyed']) {
              thisClass.ref.detectChanges();
            }
          }
        } else {
          thisClass.travelService.currentTravel.finalDestination.shortName = 'N/D';
          if (!thisClass.ref['destroyed']) {
            thisClass.ref.detectChanges();
          }
        }
      });
    } else {
      thisClass.travelService.currentTravel.finalDestination.shortName = 'N/D';
      if (!thisClass.ref['destroyed']) {
        thisClass.ref.detectChanges();
      }
    }
  }

  isPriceAgreed() {
    return (
      this.travel.hideAmountsDriver && this.paymentMethod === PaymentMethodValueEnum.CHECKING_ACCOUNT
    );
  }

  private checkHighlightAddresses() {
    this.storageService.getData(StorageKeyEnum.highlightAddresses)
      .then(highlight => {
        this.highlightAddresses = !!highlight;
      });
  }

  private setWaitMinutes() {
    if(this.travelService.currentTravel.waitMinutes == null) {
      let minutes = 0;
      let seconds = 0;
      this.travelService.currentTravel.waitDetailList.forEach(waitDetailItem => {
        minutes = minutes + waitDetailItem.minutes;
        seconds = seconds + waitDetailItem.seconds;
      });
      this.travelService.currentTravel.waitMinutes = minutes + Math.floor(seconds / 60);
    }
  }

  getCurrencySymbol() {
    return this.localizationService.localeData
      ? this.localizationService.localeData.currency.symbol
      : '$';
  }
}


