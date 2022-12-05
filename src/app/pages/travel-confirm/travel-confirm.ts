import { Component } from '@angular/core';
import { TravelService } from '../../services/travel.service';
import { IdentityService } from '../../services/identity.service';
import { LoadingService } from '../../services/loading-service';
import { AlertsService } from '../../services/common/alerts.service';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';
import { LocalizationService } from '../../services/localization/localization.service';
import { ChatService } from '../../services/chat.service';
import { NavigationService } from '../../services/navigation.service';
import { RouteWaypointModel } from '../../models/routeWaypoint.model';
//import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { NavController, NavParams, Platform, MenuController, ModalController } from '@ionic/angular';
import { TravelCancelModal } from '../travel-cancel/travel-cancel';
import { ImageModalComponent } from 'src/app/components/image-modal/image-modal.component';
import { ActivatedRoute, Router } from '@angular/router';
import { TravelConfirmModel } from 'src/app/models/travel-confirm.model';

@Component({
  selector: 'app-page-travel-confirm',
  templateUrl: 'travel-confirm.html',
  styleUrls: ['travel-confirm.scss']
})
export class TravelConfirmPage {

  isVisibleEmergencyButton = true;
  data : TravelConfirmModel = new TravelConfirmModel();
  highlightAddresses: boolean = false;
  autoShowmap: boolean = false;
  currentDate: Date =  new Date();
  carrierImage: string = "";

  isPassengerImageFullScreen:boolean=true;

  constructor(
    private navCtrl: NavController,
    private travelService: TravelService,
    private identityService: IdentityService,
    private chatService: ChatService,
    private loadingService: LoadingService,
    private alertService: AlertsService,
    private platform: Platform,
    //private nativeAudio: NativeAudio,
    private storageService: StorageService,
    private menu: MenuController,
    private translateService: TranslateService,
    private modalCtrl: ModalController,
    public localizationService: LocalizationService,
    private navigationService: NavigationService,
    private router:Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ionVieWillLoad(){
    this.carrierImage = this.identityService.getCarrierImage();
  }

  ionViewWillEnter() {
    this.menu.enable(false);
    this.checkHighlightAddresses();

    /*this.nativeAudio.play('uniqueId3')
      .then(success => {
        console.log('Audio=>UniqueID3');
      })
      .catch(err => {
        this.nativeAudio.preloadComplex('uniqueId3', "assets/audio/claxon.mp3",1,1,0)
          .then(success => {
            this.nativeAudio.play('uniqueId3');
            console.log('Audio=>UniqueID3');
          }).catch(
            err => {
              console.error("audio claxon error",err);
            }
          );
      });
*/
    //show map automatically depending on settings
    this.autoShowmap = this.storageService.getData(StorageKeyEnum.autoShowMapOnTravel)
  
    this.platform.backButton.subscribe(() => {
      let vm = this;

      let cancelAction = function(){
        vm.alertService.showingMessage = false;
      }

      let confirmAction = function(){
        vm.cancel();
        vm.alertService.showingMessage = false;
      }

      this.alertService.dialog(
        this.t("travel_confirm.cancel_trip_title"),
        this.t("travel_confirm.cancel_trip_message"),
        this.t("buttons.ok"), this.t("buttons.cancel"),
        confirmAction,
        cancelAction
      );

    });

    this.data = this.activatedRoute.snapshot.params['data']
    if(this.data.travelDate)
      this.data.travelDate = new Date(this.data.travelDate);
    this.currentDate = new Date();
  }

  private checkHighlightAddresses() {
    this.highlightAddresses = this.storageService.getData(StorageKeyEnum.highlightAddresses)
     
  }

  getCurrencySymbol() {
    return this.localizationService.localeData
      ? this.localizationService.localeData.currency.symbol
      : '$';
  }

  getCurrentLang(): string {
    return this.translateService.currentLang
      ? this.translateService.currentLang
      : this.translateService.defaultLang;
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  public appearBtnEmergency() {
    this.isVisibleEmergencyButton = !this.isVisibleEmergencyButton;
  }

  public confirm() {
    this.travelService.timerReset();
    this.travelService.passengerImage = this.data.passengerImage;

    this.loadingService.show();

    this.travelService.goingToClient(
      this.data.travelId,
      +this.identityService.carrierUserId,
      +this.identityService.userId
    ).then(async (response: CurrentTravelModel) => {

      await this.navigationService.clearTransistorPointsBuffer();
      this.travelService.currentTravel = new CurrentTravelModel();


      this.travelService.currentTravel = response;
      this.travelService.currentTravel.affiliateData = this.data.affiliateData;
      this.travelService.currentTravel.endTolerancePercent = response.endTolerancePercent;
      this.travelService.currentTravel.travelDate = this.data.travelDate;
      const visitedWaypoints = this.travelService.currentTravel.visitedWaypoints;

      this.travelService.pickUpPoint  = null;
      this.travelService.dropOffPoint = null;

      const location = await this.navigationService.getCurrentBackgroundPosition();

      this.travelService.pickUpPoint = new RouteWaypointModel({"lat":location.coords.latitude,"lng":location.coords.longitude},1,1, location.timestamp);

      // this.travelService.currentTravel.routeWaypoints.push(this.travelService.pickUpPoint);


      try {
        await this.travelService.generateAuditInfo();
      } catch(error) {
        console.error('Error in travelService.generateAuditInfo from travel confirm => ', error);
      }


      const pendingWaypoints = await this.travelService
        .setPendingWaypoints(
          this.travelService.currentTravel.waypoints,
          visitedWaypoints ? visitedWaypoints : [],
          this.travelService.currentTravel.roundTrip,
          this.travelService.currentTravel.destination
        );

      this.travelService.currentTravel.pendingWaypoints = pendingWaypoints;
      await this.travelService.saveCurrentTravel();

      await this.chatService.createChat(this.travelService.currentTravel, this.identityService.fullName);

      await this.router.navigate(["TravelToStartPage", {
        showMapOnlyOnce: this.autoShowmap
      }]);

      this.loadingService.hide();
    }).catch(err => {
      this.loadingService.hide();
      this.alertService.show("Aviso", err.message);
      if (err.status !== 0) //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
    });
  }

  public cancel() {
    this.loadingService.show();
    this.travelService.refuseTravel(
      this.data.travelId,
      +this.identityService.carrierUserId,
      +this.identityService.userId
    ).then(response => {
      this.loadingService.hide();
      //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
    }).catch(error => {
      this.loadingService.hide();
      //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
    });
  }

  async cancelTravel() {

      const modal = await this.modalCtrl.create({
        component: TravelCancelModal,
        cssClass: 'popUp-Modal popUp-Modal-sm',
        componentProps:{ incomingTrip: true}
      });

      modal.onDidDismiss().then((cancel) => {

          if(cancel) return this.cancel();
      });

      return await modal.present();
	}

  async openPreview(){
    if (this.data.passengerImage){
      let imagePassenger: HTMLImageElement = new Image();
      imagePassenger.src = this.data.passengerImage;
      const modal = await this.modalCtrl.create({
        component: ImageModalComponent,
        cssClass: 'popUp-Modal popUp-Modal-sm',
        componentProps:{img: imagePassenger, editable:false}
      });

      return await modal.present();
    }

  }

}
