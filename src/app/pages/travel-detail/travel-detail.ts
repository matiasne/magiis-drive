import { Component, ViewChild, Input, ElementRef, ChangeDetectorRef,  Renderer2, SimpleChanges, OnChanges} from '@angular/core';
import { NavigationService } from '../../services/navigation.service';
import { AlertsService } from '../../services/common/alerts.service';
import { TravelService } from '../../services/travel.service';
import { TravelListModel } from '../../models/travel-list.model';
import { TranslateService } from '@ngx-translate/core';
import { Waipoint } from '../../models/waypoint.model';
import { Location } from '../../models/location.model';
import { TravelDetailModel } from '../../models/travel-detail.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LoadingService } from '../../services/loading-service';
import { TravelImages } from '../../services/enum/travel-images.enum';
import { WaitDetailItemModel } from '../../models/wait-detail-item.model';
import { PopPictureComponent } from '../../components/pop-picture/pop-picture';
import { ITollDetailResponse, IParkingDetailResponse, IOtherCostDetailResponse } from '../../services/connection/interfaces/apiInterfaces';
import { LocalizationService } from '../../services/localization/localization.service';
import { NavController, Platform, ModalController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageAttachModalPage } from 'src/app/components/image-attach-modal/image-attach-modal';

declare var google;

@Component({
  selector: 'app-page-travel-detail',
  templateUrl: 'travel-detail.html',
  styleUrls:['travel-detail.scss']
})
export class TravelDetailPage implements OnChanges {
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('accordionContent') elementView: ElementRef;
  @ViewChild(PopPictureComponent) popPicture : PopPictureComponent;

  @Input() data: any;

  map: any;
  latitude: string;
  longitude: string;
  travel: TravelListModel;
  path: Array<Location>;
  travelDetail: TravelDetailModel;

  avoidHighways: boolean;
  avoidTolls: boolean;
  tollAmount: number | null;
  parkingAmount: number | null;
  waypoints: Array<Waipoint> | null;
  travelWaitTime: number;
  travelDistance: number;
  travelSignature: string = '';
  existSignature: boolean = false;
  locale: string;

  viewReady: boolean = false;
  expanded: boolean = false;
  iconCheck = 'assets/svg/check-circle-solid.svg';

  isAnHour: boolean = false;
  travelDuration: string = '';

  travelImages:TravelImages;

  private geocoder;

  constructor(
    public navCtrl: NavController,
    private platform: Platform,
    private navigationService: NavigationService,
    private alertService: AlertsService,
    private travelService: TravelService,
    private translateService: TranslateService,
    private ref: ChangeDetectorRef,
    public renderer: Renderer2,
    private loadingService: LoadingService,
    private modalCtrl: ModalController,
    public localizationService: LocalizationService,
    public activatedRoute:ActivatedRoute,
    private router: Router,
  ) {

    try {
			this.geocoder = new google.maps.Geocoder();
		} catch (err) {
			console.error("Error al cargar la libreria de google", err);
		}
    this.travel = new TravelListModel();
    this.travelDetail = new TravelDetailModel();
    //this.travel = this.router.getCurrentNavigation().extras.state.travel;
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.travel = changes.data.currentValue;
    console.log("Travel", this.travel);
    this.ionViewDidEnter();
  }

  ionViewDidEnter() {
   this.locale = this.getCurrentLang();
  

   console.log("Entro al didenter");
   this.drawTravelDetails();
  // this.setTravelSignature(this.travel.travelId);
  }

  ionViewWillEnter() {
   this.viewReady = false;
   this.platform.backButton.subscribe(() => {
     this.navCtrl.pop();
   });
  }

  getCurrencySymbol() {
    return this.localizationService.localeData
      ? this.localizationService.localeData.currency.symbol
      : '$';
  }

  /**
   * Translation service.
   * @param translationKey String to translate.
   */
  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  /**
   * Return current language.
   */
  private getCurrentLang(): string {
    return this.translateService.currentLang
      ? this.translateService.currentLang
      : this.translateService.defaultLang;
  }

  /**
   * Get the trip details and load the map elements.
   */
  private async drawTravelDetails(): Promise<any> {
    this.loadingService.show();

    return this.travelService
      .getTravelDetail(this.travel.travelId)
      .then((response: TravelDetailModel) => {
        this.travelDetail = response;
        console.log("this.travelDetail", this.travelDetail);
        console.log('mmmmmmmmm')
        console.log( 'google', google )
        const origin = new google.maps.LatLng(
          +response.origin.latitude,
          +response.origin.longitude
        );
        const destination = new google.maps.LatLng(
          +response.destination.latitude,
          +response.destination.longitude
        );

        // Load the map centered by the received latitude and longitude.
        this.loadMap(origin);
 
        // Draw markers in map.
        this.drawMarkers(
          response.waypoints,
          response.routeMap,
          origin,
          destination,
          response.useDistanceMatrix
        );

        this.travelDetail.waitDetailList = this.parseWaitTimeDetail(this.travelDetail.waitDetailList);
        this.travelDuration = this.parseTravelDuration(this.travelDetail.travelDuration);
        this.viewReady = true;
        this.loadingService.hide();
      })
      .catch(error => {
        this.alertService.show(
          this.t('travel_detail.alert_title'),
          this.t('travel_detail.error_message')
        );
        this.viewReady = false;
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
        this.loadingService.hide();
        this.navCtrl.pop();
      });
  }

  /**
   * Load the map marks and set the travel stops.
   * @param waypoints Waypoints.
   * @param routeMap Travel stops.
   * @param origin Origin place.
   * @param destination Final destination.
   */
  private drawMarkers(
    waypoints: Array<Waipoint>,
    routeMap: Array<any>,
    origin: google.maps.LatLng,
    destination: google.maps.LatLng,
    useDistanceMatrix: boolean = false
  ): void {
    this.path = new Array<Location>();
    const markersGoogle = [];
    // Draw waypoints
    if (waypoints) {
      for (let waypoint of waypoints) {
        const point = <Location>{
          lat: +waypoint.latitude,
          lng: +waypoint.longitude
        };
        new google.maps.Marker({
          position: point,
          map: this.map,
          icon: 'assets/images/icono-car-destination.png'
        });

        markersGoogle.push(google.maps.LatLng(
          +waypoint.latitude,
          +waypoint.longitude
        ));
      }
    }

    this.path.push(<Location> {
      lat: +origin.lat(),
      lng: +origin.lng()
    });

    if(useDistanceMatrix==false) {
      for (let routePoint of routeMap) {
        const rpoint = <Location>{
          lat: +routePoint.latitude,
          lng: +routePoint.longitude
        };
        this.path.push(rpoint);
      }

      const flightPath = new google.maps.Polyline({
        path: this.path,
        geodesic: true,
        strokeColor: '#6495ED',
        strokeOpacity: 1.0,
        strokeWeight: 8
      });
      flightPath.setMap(this.map);

      this.addMarkerOriginAndDestination(origin, destination);

      // Display all points of interest on the map.
      var bounds = new google.maps.LatLngBounds();
      bounds.extend(origin);
      bounds.extend(destination);
      this.map.fitBounds(bounds);

    } else {
      const directionsService = new google.maps.DirectionsService;
      const directionsDisplay = new google.maps.DirectionsRenderer;
      directionsDisplay.setMap(this.map);

      const configRoute = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        provideRouteAlternatives: true,
        waypoints: markersGoogle,
        avoidTolls: this.travelDetail.avoidTolls,
        avoidHighways: this.travelDetail.avoidHighways
      }

      directionsService.route(configRoute, (response, status) => {
        if (status === 'OK') {
          if (this.travelDetail.fastestRoute) [this.getFastestRoute(response)];
          else response.routes = [this.getShortestRoute(response)];
          directionsDisplay.setDirections(response);
        } else {
          console.error('error in directionsService.route => ', {status: status, response: response} )
        }
      });
    }

    if (this.map.getZoom() > 18) this.map.setZoom(18);
  }

  getShortestRoute(routeResponse: google.maps.DirectionsResult) {
    let shortestRoute;
    routeResponse.routes.forEach(function(route, index) {
      if(!shortestRoute || route.legs[0].distance.value < shortestRoute.legs[0].distance.value)
        shortestRoute = route;
    });
    return shortestRoute;
  }

  getFastestRoute(routeResponse: google.maps.DirectionsResult) {
    let fastestRoute;
    routeResponse.routes.forEach(function(route, index) {
      if(!fastestRoute || route.legs[0].duration.value < fastestRoute.legs[0].duration.value)
        fastestRoute = route;
    });
    return fastestRoute;
  }

  editItem(
    type:string,
    item: any
  ): void {
    this.loadingService.show();
    if (item.image) this.showEditItemDialog(type, item);
    else {
      let request;

      switch(type) {
        case TravelImages.TOLL:
          request = this.travelService.getTravelToll(
            +this.travelDetail.carrierId,
            +this.travelDetail.travelId,
            +item.id
          );
          break;
        case TravelImages.PARKING:
          request = this.travelService.getTravelParking(
            +this.travelDetail.carrierId,
            +this.travelDetail.travelId,
            +item.id
          );
          break;
        case TravelImages.OTHER:
          request = this.travelService.getTravelOtherCost(
            +this.travelDetail.carrierId,
            +this.travelDetail.travelId,
            +item.id
          );
      }

      request
        .then((ticket: ITollDetailResponse | IParkingDetailResponse | IOtherCostDetailResponse) => {
          // Ok, get ticket
          this.showEditItemDialog(type, ticket);
        })
        .catch(error => {
          this.loadingService.hide();
        });
    }
  }

  /**
   * Load map centered with a location.
   * @param location google.maps.LatLng.
   */
  private loadMap(location: google.maps.LatLng): void {
    this.navigationService
      .loadMapCenter(this.mapElement, location)
      .subscribe(map => (this.map = map));
  }

  //converts minutes to 00:00 horas/minutos
  public parseTravelDuration(travelDuration: number): string {
    const hours: number = Math.floor(travelDuration / 60);
    const minutes: number = travelDuration % 60;
    let time: string = '';
    if (hours < 1) {
      time = minutes.toString();
    } else {
      this.isAnHour = true;
      time = ('00' + hours).substr(-2) + ':' + (minutes < 10 ? '0' : '') + minutes;
    }

    return time;
  }

  private parseWaitTimeDetail(waitTimeDetail: WaitDetailItemModel[]): WaitDetailItemModel[] {
    const waitTimeList: WaitDetailItemModel[] = [];

    if (waitTimeDetail && waitTimeDetail.length > 0) {
      waitTimeDetail.forEach(
        wT => waitTimeList.push(new WaitDetailItemModel(
          new Date(wT.startDate), new Date(wT.endDate)
        ))
      );
    }

    return waitTimeList;

  }

  /**
   * Retrieve the server travel signature.
   * @param travelId ID Travel.
   */
  private async setTravelSignature(travelId: number) {
    this.travelService
      .getTravelSignature(travelId)
      .then(response => {
        this.travelSignature = response.signature;
        this.existSignature = true;
      })
      .catch((err: HttpErrorResponse) => {
        console.error('Error al solicitar imagen', err);
        if (err.status == 404) {
          console.error('No se encontró una firma.');
          this.existSignature = false;
        }
      });
  }

  private async showEditItemDialog(
    type: string,
    ticket: any
  ) {

      const imageAttachModal = await this.modalCtrl.create({
        component: ImageAttachModalPage,
        componentProps:{type, ticket ,
         enableBackdropDismiss: false},
         cssClass: 'popUp-Modal modalImageAttach'
      });

      imageAttachModal.onDidDismiss().then((itemUpdated: any) => {
        if (itemUpdated) {
          if (type === TravelImages.TOLL) this.updateToll(itemUpdated);
          else if(type === TravelImages.PARKING) this.updateParking(itemUpdated);
          else this.updateOtherCost(itemUpdated);
        }
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      });
    this.loadingService.hide();
      return await imageAttachModal.present();
  }


  showTicket(
    type: string,
    item: ITollDetailResponse | IParkingDetailResponse
    ): void {
      this.loadingService.show();
      if (item.image) {
        const picture = item.image;
        const caption = `${item.name} $${item.price}`
        this.loadingService.hide();
        this.popPicture.open(picture, caption);
      }
      else {
        const request =
        type === TravelImages.TOLL
          ? this.travelService.getTravelToll(
              +this.travelDetail.carrierId,
              +this.travelDetail.travelId,
              +item.id
            )
          : this.travelService.getTravelParking(
              +this.travelDetail.carrierId,
              +this.travelDetail.travelId,
              +item.id
            );

        request
          .then((ticket: ITollDetailResponse | IParkingDetailResponse) => {
            // Ok, get ticket
            if (ticket.image) {
              const picture = ticket.image;
              const caption = `${ticket.name} $${ticket.price}`
              this.loadingService.hide();
              this.popPicture.open(picture, caption);
            } else {
              // Interpolate param for value insertion in translation.
              const _type = {
                "value":
                  type === TravelImages.TOLL
                  ? this.t('travel_detail.label_toll')
                  : this.t('travel_detail.label_parking')
              }
              this.loadingService.hide();
              this.alertService.show(
                this.t('travel_detail.get_item_image_not_found.alert_title'),
                this.translateService.instant('travel_detail.get_item_image_not_found.alert_subtitle', _type)
              );
            }
          })
          .catch(error => {
            this.loadingService.hide();
          });
      }
  }

  private updateToll(tollToUpdate: ITollDetailResponse): void {
    this.loadingService.show();
    this.travelService.updateTravelToll(
      +this.travelDetail.carrierId,
      +this.travelDetail.travelId,
      tollToUpdate
    ).then(tollUpdated => {
      const foundIndex = this.travelDetail.tollList.findIndex(toll => toll.id === tollUpdated.id);
      if (foundIndex !== -1) this.travelDetail.tollList[foundIndex] = tollUpdated;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.loadingService.hide();
    })
    .catch(error => {
      this.loadingService.hide();
    });
  }

  private updateParking(parkingToUpdate: IParkingDetailResponse): void {
    this.loadingService.show();
    this.travelService.updateTravelParking(
      +this.travelDetail.carrierId,
      +this.travelDetail.travelId,
      parkingToUpdate
    ).then(parkingUpdated => {
      const foundIndex = this.travelDetail.parkingList.findIndex(parking => parking.id === parkingUpdated.id);
      if (foundIndex !== -1) this.travelDetail.parkingList[foundIndex] = parkingUpdated;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.loadingService.hide();
    })
    .catch(error => {
      this.loadingService.hide();
    });
  }

  private updateOtherCost(costToUpdate: IOtherCostDetailResponse): void {
    this.loadingService.show();
    this.travelService.updateTravelOtherCost(
      +this.travelDetail.carrierId,
      +this.travelDetail.travelId,
      costToUpdate
    ).then(costUpdated => {
      const foundIndex = this.travelDetail.otherCostList.findIndex(cost => cost.id === costUpdated.id);
      if (foundIndex !== -1) this.travelDetail.otherCostList[foundIndex] = costUpdated;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.loadingService.hide();
    })
    .catch(error => {
      this.loadingService.hide();
    });
  }

  addMarkerOriginAndDestination(origin, destination): void {
    // Mark origin position.
    new google.maps.Marker({
      position: origin,
      map: this.map,
      icon: 'assets/images/icono-car-origin.png'
    });

    // Mark destination position.
    new google.maps.Marker({
      position: destination,
      map: this.map,
      icon: 'assets/images/icono-car-destination.png'
    });
  }
}
