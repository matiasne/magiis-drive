import { Component, ChangeDetectorRef } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
//import { NativeAudio } from "@awesome-cordova-plugins/native-audio/ngx";
import { StatusBar } from "@awesome-cordova-plugins/status-bar/ngx";
import { NavController, Platform, MenuController,  ModalController, AlertInput } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Subject, takeUntil, take } from "rxjs";
import { ImageModalComponent } from "src/app/components/image-modal/image-modal.component";
import { CurrentTravelModel } from "src/app/models/current-travel.model";
import { RouteWaypointModel } from "src/app/models/routeWaypoint.model";
import { CallService } from "src/app/services/call.service";
import { ChatService } from "src/app/services/chat.service";
import { AlertsService } from "src/app/services/common/alerts.service";
import { CallEnum } from "src/app/services/enum/call.enum";
import { TravelStatusEnum } from "src/app/services/enum/travelStatus";
import { IdentityService } from "src/app/services/identity.service";
import { LoadingService } from "src/app/services/loading-service";
import { LocalizationService } from "src/app/services/localization/localization.service";
import { NavigationService } from "src/app/services/navigation.service";
import { StatusService } from "src/app/services/status.service";
import { StorageService } from "src/app/services/storage/storage.service";
import { StorageKeyEnum } from "src/app/services/storage/storageKeyEnum.enum";
import { TravelService } from "src/app/services/travel.service";
import { TravelCancelModal } from "../travel-cancel/travel-cancel";

@Component({
	selector: 'app-page-travel-to-start',
	templateUrl: 'travel-to-start.html',
  styleUrls: ['travel-to-start.scss'],
})

export class TravelToStartPage {
  private destroy$: Subject<boolean> = new Subject<boolean>();

	map: any;
	checked: boolean = false;
  currentLatLng;
  showMapOnlyOnce: boolean = false;

	//timer
	timerSeconds: number = 0;
	timerMinutes: number = 0;
	timerOn: boolean = false;

	timerHandle;
	onWaitClass: string = "";

	carrierImage: string = "";

  autoShowmap: boolean = false;
  highlightAddresses: boolean = false;

  travel: CurrentTravelModel = new CurrentTravelModel();
  travelWithOpenDestination: boolean;

  isVisible = false;

  passengerImage:String;

  chatWithUnreadMessages: boolean;

  //Direcciones Separadas
  fromNameSeparate = ['',''];
  toNameSeparate = ['',''];
  wayPointsSeparate = ['',''];

	constructor(private navCtrl: NavController,
		private travelService: TravelService,
		private identityService: IdentityService,
		private loadingService: LoadingService,
		private alertService: AlertsService,
		private ref:ChangeDetectorRef,
		private platform: Platform,
    public sanitizer: DomSanitizer,
		private callService: CallService,
		private storageService: StorageService,
		private menu: MenuController,
		private translateService: TranslateService,
    private statusBar: StatusBar,
    private statusService: StatusService,
    private modalCtrl: ModalController,
    private navigationService: NavigationService,
    private chatService: ChatService,
    //private nativeAudio: NativeAudio,
    public localizationService: LocalizationService,
    private router:Router,
    private activatedRoute:ActivatedRoute
	) {
    this.showMapOnlyOnce =  this.activatedRoute.snapshot.params['showMapOnlyOnce']; 
    this.passengerImage = this.travelService.passengerImage;
  }

	private t(translationKey: string) {
		return this.translateService.instant(translationKey);
	}

  public viewAddress(addShortName:string){
    let addressWithoutProvince = addShortName.split(",");
    addressWithoutProvince.splice(addressWithoutProvince.length-2,2);
    const addressFinal = '<p><span class="bigAlert">'+addressWithoutProvince.join(",")+'</span></p>';
    return this.alertService.show("", addressFinal);
  }

  sanitize(img: string) {
    let rsta = null;
    try{
      rsta = this.sanitizer.bypassSecurityTrustUrl(img);
    }catch(e){
      try {
      rsta = this.sanitizer.bypassSecurityTrustStyle("url(" + img + ")");
      }catch(e){
        rsta = img;
      }
    }
    return rsta;
  }

	ionViewDidEnter() {
    console.log(this.travelService.currentTravel);
		this.platform.backButton.subscribe(() => {
			this.loadingService.hide();
			this.openCancelTravelModal();
		});

		//load carrier img
    this.carrierImage = this.travelService.currentTravel.affiliateData ?
      this.travelService.currentTravel.affiliateData.carierImage :
      this.identityService.getCarrierImage();

    this.checkHighlightAddresses();

    this.chatService.unreadMessages
      .pipe(takeUntil(this.destroy$))
      .subscribe((unreadMessages: boolean) => {
        if(unreadMessages) {
       /*   this.nativeAudio.play('uniqueId4')
            .then(success => {
              console.log('Audio=>UniqueId4');
            })
            .catch(err => {
              this.nativeAudio.preloadComplex('uniqueId4', "assets/audio/chat.mp3",1,1,0)
                .then(success => {
                  this.nativeAudio.play('uniqueId4');
                  console.log('Audio=>UniqueID4');
                }).catch(
                  err => {
                    console.error("audio chat error",err);
                  }
                );
            });*/
        }
        this.chatWithUnreadMessages = unreadMessages;
      });

    this.platform.resume.pipe(takeUntil(this.destroy$)).subscribe(async() => {
      this.statusService.getCurrentTripData(this.travel.travelId)
        .then((serverCurrentTrip: CurrentTravelModel) => {
          if (this.travel) {
            if (this.travel.fromName != serverCurrentTrip.fromName) {
              this.updateTravel();
            }
            if (this.travel.toName != serverCurrentTrip.toName) {
              this.updateTravel();
            }
            if (this.travel.note != serverCurrentTrip.note) {
              this.updateTravel();
            }
          }

          if ((!serverCurrentTrip.waypoints && this.travel.waypoints) || (serverCurrentTrip.waypoints && !this.travel.waypoints)) {
            this.updateTravel();
          }
          else if (serverCurrentTrip.waypoints) {
            for (let i = 0; i < serverCurrentTrip.waypoints.length; i++) {
              if (this.travel.waypoints[i].shortName != serverCurrentTrip.waypoints[i].shortName) {
                this.updateTravel();
                return;
              }
            }
          }
        })
    });
	}

  private updateTravel() {
      this.alertService.show(
        this.t("home.udpated_trip_title"),
        this.t("home.updated_trip_message")
      );
      if (this.travelService.currentTravel.travelStatus !== TravelStatusEnum.travelInProgress) {
        this.travelService.removeCurrentTravel();
        //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
      }
  }

  ionViewWillLeave() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

	async ionViewWillEnter() {
		this.menu.enable(false);
		this.travelService.timer(false);
    this.travelService.timerReset();
    if (this.showMapOnlyOnce) {
      this.showMap();
    }
		//show map automatically depending on settings
    this.autoShowmap = this.storageService.getData(StorageKeyEnum.autoShowMapOnTravel)
     
		console.log("travelService.currentTravel", this.travelService.currentTravel);
    this.travel = this.travelService.currentTravel;
    this.travelWithOpenDestination = (
      this.travel.fromName == this.travel.toName &&
      !this.travel.roundTrip &&
      (!this.travel.waypoints || this.travel.waypoints.length === 0)
    );

    //Parseo las direcciones
     this.checkIfUnreadMessages();
	}

  async openCancelTravelModal() {

const modal = await this.modalCtrl.create({
        component: TravelCancelModal,
        componentProps:{ incomingTrip: false },
        cssClass: 'popUp-Modal popUp-Modal-sm'
      });
await modal.present();

    let travelCancellation: boolean

    try {
      travelCancellation = await this.storageService.getData(StorageKeyEnum.travelCancellation);
    } catch(error) {
      console.error(error)
    }

    modal.onDidDismiss().then((cancel:any) => {
      if(travelCancellation && cancel !== null) this.openCancelTravelCode(cancel);
      if(!travelCancellation && cancel !== null) this.cancelTravelWithoutCode(cancel );
    });
  }

  cancelTravelWithoutCode(reason: string){
    const vm = this;
    vm.storageService.setData(StorageKeyEnum.readMessages, null);
    vm.cancel(reason);
    //vm.alertService.showingMessage = false;
  }

	openCancelTravelCode(reason: string) {
    const vm = this;
    const insertCodeConfirmAction = function(alertData) {
      const code = alertData.code;
      let travelId: string;
      travelId = vm.travelService.currentTravel.travelId.toString();
      travelId = travelId.substr(travelId.length-4);

      if(travelId === code) {
        vm.storageService.setData(StorageKeyEnum.readMessages, null);
        vm.cancel(reason);
        vm.alertService.showingMessage = false;
      } else {
        vm.alertService.toast(vm.t('travel_to_start.insert_code_error_message'));
        return false;
      }
    }
    const cancelAction = function() {
      vm.alertService.showingMessage = false;
    }
    const inputs: AlertInput[] = [{
      name: 'code',
      placeholder: vm.t("travel_to_start.label_code"),
      id: 'code',
      type: 'number',
      max: 9999
    }];

    vm.alertService.inputDialog(
      vm.t("travel_to_start.cancellation_insert_code_title"),
      vm.t("travel_to_start.insert_code_message"),
      inputs,
      "geocerca-code-alert-input",
      vm.t("buttons.ok"),
      vm.t("buttons.cancel"),
      insertCodeConfirmAction,
      cancelAction,
      true
    );
	}

	public startTravel() {
    this.loadingService.show();
		let vm = this;
		let confirmAction = function() {
      vm.loadingService.show();
			vm.alertService.showingMessage = false;

      //Limpio transistor, limpio route waypoints y marco el inicio del viaje con el primer punto
      vm.navigationService.clearTransistorPointsBuffer();
      vm.travelService.currentTravel.routeWaypoints = [];
      vm.travelService.currentTravel.sortedRouteWaypoints = [];
      vm.travelService.currentTravel.origRouteWaypoints = [];
      vm.navigationService.getActualPosition().then(location=>{
        vm.travelService.pickUpPoint = new RouteWaypointModel({"lat":location.coords.latitude,"lng":location.coords.longitude},1,1, location.timestamp);
        vm.travelService.savePickUpPointToStorage();
        vm.travelService.currentTravel.routeWaypoints.push(vm.travelService.pickUpPoint);
      });

			if(vm.timerOn) vm.toggleTimer();
      vm.travelService.goingToDestination(vm.travelService.currentTravel.travelId, +vm.identityService.carrierUserId, false);
      vm.continueTrip();
		}

    let cancelAction = function() {
			vm.alertService.showingMessage = false;
    }

    let insertCodeConfirmAction = function(alertData){
      console.log("code: " + alertData.code);
      let code = alertData.code;
      let travelId: string;
      //obtengo los ultimos 4 caracteres del id del viaje
      travelId = vm.travelService.currentTravel.travelId.toString();
      travelId = travelId.substr(travelId.length-4);
      console.log("tarvelId: " + travelId);

      if(travelId === code){
        console.log("code ok");
        vm.loadingService.show();
        vm.alertService.showingMessage = false;
        if(vm.timerOn) vm.toggleTimer();

        try {
          vm.travelService.currentTravel.auditInfo.travelStartTime = new Date();
        } catch(error) {
          console.log("Error al guardar datos de auditoria");
          console.error(error);
        }

        vm.continueTrip();
        try {
          //Limpio transistor, limpio route waypoints y marco el inicio del viaje con el primer punto
          vm.navigationService.clearTransistorPointsBuffer();
          vm.travelService.currentTravel.routeWaypoints = [];
          vm.navigationService.getActualPosition().then(location=>{
            vm.travelService.pickUpPoint = new RouteWaypointModel({"lat":location.coords.latitude,"lng":location.coords.longitude},1,1, location.timestamp);
            vm.travelService.savePickUpPointToStorage();
            vm.travelService.currentTravel.routeWaypoints.push(vm.travelService.pickUpPoint);
          });

          vm.travelService.goingToDestination(vm.travelService.currentTravel.travelId, +vm.identityService.carrierUserId, true)
            .then(() => {
              console.log("[travelService.goingToDestination]: Cambio de estado enviado exitosamente.");
            })
            .catch(() => {
              console.log("[travelService.goingToDestination]: Cambio de estado enviado exitosamente.");
            });
        } catch(error) {
          console.log("[travelService.goingToDestination]: Error al enviar cambio de estado. Puede deberse a un fallo de conexión. Se continua el viaje localmente.");
        }
      }else{
        vm.alertService.toast(vm.t('travel_to_start.insert_code_error_message'));

        return false;
      }
    }

    let insertCodeAction = function() {
      console.log("Ingresar codigo");
      vm.alertService.showingMessage = false;
      //Creo modal para ingreso de codigo
      let inputs: AlertInput[] = [
                    {name: 'code',
                    placeholder: vm.t("travel_to_start.label_code"),
                      id: 'code',
                      type: 'number',
                      max: 9999
                    }
                  ];
      vm.alertService.inputDialog(
        vm.t("travel_to_start.insert_code_title"),
        vm.t("travel_to_start.insert_code_message"),
        inputs,
        "geocerca-code-alert-input",
        vm.t("buttons.ok"),
        vm.t("buttons.cancel"),
        insertCodeConfirmAction,
        cancelAction
      );
    }

    this.statusService.canPickUp()
      .then(res => {
        this.loadingService.hide();
        this.alertService.showingMessage = false;
        if(res) {
          this.alertService.dialog(
            this.t("travel_to_start.start_trip_message_title"),
            this.t("travel_to_start.start_trip_message"),
            this.t("buttons.yes"),
            this.t("buttons.no"),
            confirmAction,
            cancelAction
          );
        } else {
          this.alertService.dialog(
            this.t("travel_to_start.geocerca_alert_title"),
            this.t("travel_to_start.geocerca_alert_message"),
            this.t("travel_to_start.insert_code"),
            this.t("buttons.close"),
            insertCodeAction,
            cancelAction
          );
        }
      });

	}

	private continueTrip(){
    this.travelService.currentTravel.travelStatus = TravelStatusEnum.travelInProgress;
    this.navigationService.startMoving();
    this.travelService.currentTravel.initTimer = null;
    this.travelService.currentTravel.startTravelTime = new Date();
    this.travelService.currentTravel.currentSegment = 1;
    this.travelService.setTimerOn(false);
    const pendingWaypoints = this.travelService
      .setPendingWaypoints(
        this.travel.waypoints,
        [],
        this.travel.roundTrip,
        this.travel.destination
      );
    this.travelService.currentTravel.pendingWaypoints = pendingWaypoints;
		this.travelService.saveCurrentTravel();
    this.storageService.setData(StorageKeyEnum.readMessages, null);
		this.loadingService.hide();
		this.router.navigate(["TravelInProgressPage", {
      showMapOnlyOnce: this.autoShowmap
    }]);
	}

	public toggleTimer() {
		this.timerOn = !this.timerOn;
		if(this.timerOn) {
			this.onWaitClass = "on-wait";
			this.timerHandle = setInterval( () => {
				this.timerMinutes = this.travelService.timerMinutes;
				this.timerSeconds = this.travelService.timerSeconds;
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
			}, 1000);
		}
		else {
			this.onWaitClass = "";
			clearInterval(this.timerHandle);
			if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
		}
	}

  public showChat() {
    this.router.navigate(["TravelChatPage"]);
  }

  private checkIfUnreadMessages() {
    this.chatService.getMessages(this.travel.travelId).valueChanges().pipe(take(1)).subscribe(async messages => {
      const readMessages = await this.storageService.getData(StorageKeyEnum.readMessages);
      if(readMessages < messages.length) this.chatWithUnreadMessages = true;
    });
  }

	public showMap() {
    this.loadingService.show();
    const destination = `${ this.travelService.currentTravel.fromLat },${ this.travelService.currentTravel.fromLong }`;

    if (this.platform.is('ios'))
      this.travelService.navigateToDestination('ios', destination);
    else if (this.platform.is('android'))
      this.travelService.navigateToDestination('android', destination);

		this.loadingService.hide();
	}

	public cancel(reason: string) {
		this.loadingService.show();
    this.travelService.cancelTravel(this.travelService.currentTravel.travelId, +this.identityService.carrierUserId, reason)
      .then(response => {
        this.travelService.removeCurrentTravel();
        this.loadingService.hide();
        //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
      }).catch(error => {
        console.error('Error in cancelTravel of TravelToStart => ', error);
        this.loadingService.hide();

        //option to call carrier
        const cancelAction = () => {
          this.alertService.showingMessage = false;
          this.travelService.removeCurrentTravel();
          //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
        }
        let confirmAction = function(){
          this.alertService.showingMessage = false;
          this.callService.call("CALL_CARRIER");
          this.travelService.removeCurrentTravel();
          //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
        }
        this.alertService.dialog(
          null,
          this.t("travel_to_start.error_canceling_trip"),
          this.t("buttons.call"),
          this.t("buttons.cancel"),
          confirmAction,
          cancelAction
        );

      });
	}

  private checkHighlightAddresses() {
    this.highlightAddresses = this.storageService.getData(StorageKeyEnum.highlightAddresses);     
  }

	callPassenger()
	{
		this.callService.call(CallEnum.CALL_PASSENGER);
	}

	showNameDisplay(){
		this.isVisible = true;
    this.statusBar.hide();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
	}

	hiddenNameDisplay(){
		this.isVisible = false;
    this.statusBar.show();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  async openPreview(){
    if (this.passengerImage){
      let imagePassenger: HTMLImageElement = new Image();
      imagePassenger.src = this.passengerImage.toString();
      const modal = await this.modalCtrl.create({
        component: ImageModalComponent,
        componentProps: {img: imagePassenger, editable:false}
      });
  return await modal.present();
    }

  }

  getCurrentLang(): string {
    return this.translateService.currentLang
      ? this.translateService.currentLang
      : this.translateService.defaultLang;
  }
}
