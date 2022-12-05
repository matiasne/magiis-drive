import { ConnectionServices } from "./../../services/connection/connection.service";
import { EventEnum } from "./../../services/enum/event.enum";
import { Component, ViewChild, ElementRef, ChangeDetectorRef, OnInit } from "@angular/core";
import { AlertsService } from "../../services/common/alerts.service";
import { IdentityService } from "../../services/identity.service";
import { NavigationService } from "../../services/navigation.service";
import { FirebaseService } from "../../services/firebase.service";
import { DriverStateEnum } from "../../services/enum/driver-state.enum";
import { DriverSubStateEnum } from "../../services/enum/driver-sub-state.enum";
import { TravelService } from "../../services/travel.service";
import { StorageService } from "../../services/storage/storage.service";
import { StorageKeyEnum } from "../../services/storage/storageKeyEnum.enum";
import { TravelStatusEnum } from "../../services/enum/travelStatus";
import { AuthenticationService } from "../../services/authentication.service";
import { TranslateService } from "@ngx-translate/core";
import { CurrentTravelModel } from "../../models/current-travel.model";
import { StatusService } from "../../services/status.service";
import { BranchTypeEnum } from "../../services/enum/branch-type.enum";
import { ApiInterceptor } from "../../services/api.interceptor";
import { LoadingService } from "../../services/loading-service";
import { LocalizationService } from "../../services/localization/localization.service";
import { PermissionService } from "../../services/permissions/permission.service";
import * as L from 'leaflet';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Subject } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { RouteWaypointModel } from "../../models/routeWaypoint.model";
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { NavController, Platform, MenuController, NavParams, ModalController } from "@ionic/angular";
import { Device } from "@awesome-cordova-plugins/device/ngx";
//import { NativeAudio } from "@awesome-cordova-plugins/native-audio/ngx";
import { Network } from "@awesome-cordova-plugins/network/ngx";
import { TravelConfirmPage } from "../travel-confirm/travel-confirm";
//declare var google;

declare var google;

@Component({
  selector: "page-home",
  templateUrl: "home.page.html",
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild("map") mapElement: ElementRef;

  map: any;
  //private circles: google.maps.Circle[];
  private circles: any[];
  checked: boolean = false;

  private firebaseReady: boolean = false;
  private token: string;
  public shortname: string;
  private permissionsAllowed: boolean = false;

  availableClass: string = "";
  availability: string = "";
  available: boolean = false;

  carrierImage: string = "";
  overlayHidden: boolean = true;
  fromLogin: boolean = false;

  canChangeAvailability: boolean = false;
  showSpinner: boolean = false;
  showSpinnerClass: string = ""; //showSpinner

  showMapSpinnerClass: string = "";

  showFabOverlay: boolean = false;
  showFabOverlayClass: string = "";

  carMarker;

  driverStatusClosed: string;

  unsynchronizedTravels: boolean = false;

  private updatingAppStatus: boolean = false;

  loggedUser: any;


  /*
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
    INTEGRACION DE COMPONENTE DE INFORMACION DE DRIVER /////// RESERV
  */

  destroy_c$: Subject<boolean> = new Subject<boolean>();

  homeUserInformation = {
    fullName: '',
    profilePhoto: '',
    carrierLogo: '',
    carrierCode: '',
    carrierName: '',
    currentVehicle: '',
    currentVehicleType: '',
    driverSubstate: '',
  };
  homeBaseInformation = {
    currentBaseName: '',
    inBase: false,
    inBaseRange: false,
    inBaseChecked: false,
    positionInBase: null,
    totalDriversInBase: null
  }

  showSpinner_c: boolean = false;
  checked_c: boolean = false;
  available_c: boolean = false;

  constructor(
    private navCtrl: NavController,
    private navigationService: NavigationService,
    private platform: Platform,
    private alertService: AlertsService,
    public identityService: IdentityService,
    private firebaseService: FirebaseService,
    //public events: Events,
    public menu: MenuController,
    private activatesRoute: ActivatedRoute,
   // private nativeAudio: NativeAudio,
    public travelService: TravelService,
    private storageService: StorageService,
    private authenticationService: AuthenticationService,
    private ref: ChangeDetectorRef,
    private network: Network,
    private translateService: TranslateService,
    private statusService: StatusService,
    private connectionServices: ConnectionServices,
    private loadingService: LoadingService,
    private localizationService: LocalizationService,
    private permissionService: PermissionService,
    private appVersion: AppVersion,
    private chatService: ChatService,
    private device: Device,
    private router: Router,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    setInterval(() => {
      if (
        this.identityService.driverState === DriverStateEnum.ONLINE &&
        this.identityService.driverSubState === DriverSubStateEnum.IN_STREET
      ) this.refreshIsInRange();
    }, 60000);
  }

  async ionViewDidEnter() {
    this.navigationService.checkBatterySavingMode();
    this.navigationService.setTravelService(this.travelService);
    this.navigationService.setStatusService(this.statusService);

    console.log("OS Version: " + this.device.version);
    console.log("Verifico permiso de ubicacion");
    try {
      const allowed = await this.permissionService.verifyPermissions()
      if (allowed) {
        this.permissionsAllowed = true;
        this.navigationService.initializeBackgroundGeolocation();
        this.statusService.getDriverStatusRTDB().pipe(takeUntil(this.destroy$)).subscribe(status => {
          console.log('Status RTDB: ', status);
          if (this.identityService.driverState == DriverStateEnum.ONLINE && status == DriverStateEnum.OFFLINE) {
            console.log('El carrier me saco');
            this.identityService.setDriverState(status);
            this.identityService.checkSubState(status);
            this.refreshStatusButton();
          }
        });
      }
    } catch (error) {
      console.error(error);
      this.permissionsAllowed = true;
      // this.navigationService.initializeBackgroundGeolocation();
      this.statusService.getDriverStatusRTDB().pipe(takeUntil(this.destroy$)).subscribe(status => {
        console.log('Status RTDB: ', status);
        if (this.identityService.driverState == DriverStateEnum.ONLINE && status == DriverStateEnum.OFFLINE) {
          console.log('El carrier me saco');
          this.identityService.setDriverState(status);
          this.identityService.checkSubState(status);
          this.refreshStatusButton();
        }
      });
    };

    //refresh map if came from menu
    // this.events.subscribe("HOME_FROM_MENU", async() => {
    //   this.refresh_connection();
    //   this.getAppStatus();
    // });

    //show carrier splash when came from login
    this.fromLogin = this.activatesRoute.snapshot.params["FROM_LOGIN"] === true ? true : false;
    console.log("!!!!!!!")
    console.log(this.fromLogin)
    if (this.fromLogin) this.overlayHidden = false;

    try {
      /* Load audio **/
     // await this.nativeAudio.preloadSimple("uniqueId2", "assets/audio/confident.mp3");
     // await this.nativeAudio.preloadComplex("uniqueId3", "assets/audio/claxon.mp3", 1, 1, 0);
     // await this.nativeAudio.preloadComplex("uniqueId4", "assets/audio/chat.mp3", 1, 1, 0);
    } catch (error) {
      console.error(error);
    }

    //load map
    try {
      await this.identityService.setUserType(this.platform.is("android") ? "Android" : "Ios");
      this.firebaseStartUp();
    } catch (error) {
      console.error(error)
    }

    //load carrier image
    this.carrierImage = this.identityService.getCarrierImage();

    //Look for UnsynchronizedTravels and uploads them to server
    const unsynchronizedTravels = await this.travelService.loadUnsynchronizedTravels();

    if (unsynchronizedTravels.length > 0) {
      this.unsynchronizedTravels = true;
      this.travelService.travelSyncronized$.pipe(takeUntil(this.destroy$)).subscribe((res) => {
        if (res === true) this.toggleAvailability(DriverStateEnum.ONLINE);
      });
    } else {
      this.unsynchronizedTravels = false;
    }

    // watch network for a disconnect
    this.network.onDisconnect().pipe(takeUntil(this.destroy$)).subscribe((data) => {
      console.log("network was disconnected :-(");

      if (this.network.type === this.network.Connection.NONE) {
        this.alertService.dialog(
          null,
          this.translateService.instant('network.none_conecction'),
          this.t('buttons.ok'),
          null,
          () => { this.alertService.showingMessage = false },
          null
        );
      }

      this.travelService.showLostConectionMessage = true;
      if (this.router.url.includes("HomePage")) {
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      }
    });

    this.identityService.getCarrierPlaces.subscribe(async () => {
      if (this.permissionsAllowed) {
        try {
          const location = await this.navigationService.getCurrentBackgroundPosition();
          if (location)
            this.statusService.calculateInBaseRange(
              location.coords.latitude,
              location.coords.longitude
            );
        } catch (error) {
          console.error(error)
        }
      }
      this.loadAllCircles();
    });

    this.platform.resume.pipe(takeUntil(this.destroy$)).subscribe(async () => {
      this.alertService.tinytoast(this.t('alerts.syncing_status'), 1000);
      this.refresh_connection();
      try {
        this.getAppStatus();
      } catch (error) {
        console.error("Error al actualizar app: ", error);
      }
    });

    this.travelService.getTravelList(true, 1, 100).then(response => {
      console.log(response)
    });


  }



  async ionViewWillEnter() {
    console.log("ionViewWillEnter");
    console.log("INFO WILLENTER: ", this.identityService.getUserInfo());
    console.log("INFO WILLENTER: ", this.identityService.getUserInfo());
    console.log("INFO WILLENTER: ", this.identityService.getUserInfo());
    console.log("INFO WILLENTER: ", this.identityService.getUserInfo());
    this.getHomeUserInformation();
    this.loggedUser = this.identityService.getUserInfo();
    try {
      const allowed = await this.permissionService.verifyPermissions();
      allowed ? this.permissionsAllowed = true : this.navCtrl.navigateRoot("RequiredPermissionPage");
    } catch (error) {
      console.error(error);
    }

    this.menu.enable(true);

    this.identityService.updatePreferences.subscribe(() => {
      if (!this.platform.is('desktop') && !this.platform.is('mobileweb')) {
        this.loadAllCircles()
      }
    }
    );

    // this.events.subscribe(EventEnum.REFRESH_STATE, (lat, long) => {
    //   this.drawRefreshedMap(lat, long);
    // });

    this.platform.backButton.subscribe(() => {

      let cancelAction = function () {
        this.alertService.showingMessage = false;
      };

      let exitAction = function () {
        if (this.platform.is("Android")) {
          this.platform.exitApp();
        } else {
          cancelAction();
        }
      };

      this.alertService.dialog(
        this.t("home.exit_dialog_title"),
        this.t("home.exit_dialog_message"),
        this.t("buttons.exit"),
        this.t("buttons.cancel"),
        exitAction,
        cancelAction
      );
    });

    // watch network for a connection
    this.network.onConnect().pipe(takeUntil(this.destroy$)).subscribe(() => {
      console.log("network connected!");

      if (this.network.type === this.network.Connection.NONE) {
        this.alertService.dialog(
          null,
          this.translateService.instant('network.without_connection'),
          this.t('buttons.ok'),
          null,
          () => { this.alertService.showingMessage = false },
          null
        );
      }


      if (this.network.type === this.network.Connection.UNKNOWN) {
        this.alertService.dialog(
          null,
          this.translateService.instant('network.cell_none_connection'),
          this.t('buttons.ok'),
          null,
          () => { this.alertService.showingMessage = false },
          null
        );
      }

      this.travelService.showLostConectionMessage = false;
      if (this.router.url.includes("HomePage")) {
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      }
    });

    this.checkConnection();

    setTimeout(async () => {
      this.refresh_connection();
      try {
        this.getAppStatus();
      } catch (error) {
        console.error('Error al actualizar el aplicativo.', error);
      }
    }, 500);
  }

  async getAppStatus() {
    let inOfflineCurrentTravel = false;

    if (!this.updatingAppStatus) {
      this.updatingAppStatus = true;
      const isSynchronized = await this.travelService.synchronizeOfflineData();
      // load travel in Offline Mode.
      if (!this.isConnected() || isSynchronized) {
        const currentTravel = await this.travelService.loadTripInOfflineMode();
        if (currentTravel) {
          inOfflineCurrentTravel = true;
          try {
            const travelStatus = await this.travelService.normalizeTravelValues(currentTravel, true);
            this.goToPageByTravelStatus(travelStatus);
          } catch (error) {
            console.error(error);
          }
        }
      }

      // load travel in Online Mode.
      if (!inOfflineCurrentTravel) {
        try {
          const driverStatus = await this.statusService.getDriverStatus();
          this.toggleAvailability(driverStatus.state);
          this.identityService.setOutOfService(driverStatus.outOfService);

          //there is a current trip
          if (driverStatus.currentTrip !== null && driverStatus.state === DriverStateEnum.IN_TRAVEL) {
            this.overlayHidden = true;
            try {
              const serverCurrentTrip = await this.statusService.getCurrentTripData(driverStatus.currentTrip.id);
              //if trip id is not on local storage
              const storageTripData = await this.storageService.getData(StorageKeyEnum.currentTravel);
              let storageCurrentTrip: CurrentTravelModel = null;
              let useCurrentTripFromServer = true;

              if (storageTripData !== null) {
                storageCurrentTrip = new CurrentTravelModel();
                storageCurrentTrip = JSON.parse(storageTripData);

                const compareTravelWithId = storageCurrentTrip.travelId === serverCurrentTrip.travelId;
                const compareTravelWithStatus = this.travelService.getStatusOrder(driverStatus.currentTrip.status) <= this.travelService.getStatusOrder(storageCurrentTrip.travelStatus);

                if (compareTravelWithId && compareTravelWithStatus) {
                  useCurrentTripFromServer = false;
                  this.findUnfinishedTravel();
                } else {
                  //clean old Trip from storage
                  this.travelService.removeCurrentTravel();
                }
              }

              if (useCurrentTripFromServer) {
                const travelStatus = await this.travelService.normalizeTravelValues(serverCurrentTrip, false);
                this.goToPageByTravelStatus(travelStatus);
              }
              this.updatingAppStatus = false;

            } catch (error) {
              console.error(error);
              this.updatingAppStatus = false;
            }

          } else if (driverStatus.currentTrip == null && driverStatus.incomingTripId !== null) {
            //there is an incoming trip
            this.overlayHidden = true;
            this.goToTravelConfirmPage(driverStatus.incomingTripId);
          } else { /* ESTE CASO SOLO SE DA SI EL PASAJERO CANCELA EL VIAJE DESDE PAX */
            const haveTravel = (this.travelService.currentTravel && this.travelService.currentTravel.travelId !== 0);
            const isNotStateInTravel = (driverStatus.state === DriverStateEnum.OFFLINE || driverStatus.state === DriverStateEnum.ONLINE);

            if (isNotStateInTravel && haveTravel) {
              this.travelService.removeCurrentTravel();
              if (!this.router.url.includes('HomePage') || !this.router.url.includes('OutdatedVersionPage')) {
                this.alertService.show(this.t('home.finalized_trip_title'), this.t('home.finalized_canceled_trip_message'));
                // //this.navCtrl.popToRoot();
                this.router.navigate(['HomePage']);
                this.router.navigate(['HomePage']);
              }
            }
          }


          this.canChangeAvailability = true;
          // Block application if is outdated
          if (this.identityService.driverState !== DriverStateEnum.IN_TRAVEL || this.activatesRoute.snapshot.params['FROM_TRAVEL_CLOSED']) this.checkAppVersionUpdated();
          this.updatingAppStatus = false;

        } catch (error) {
          this.canChangeAvailability = true;
          this.updatingAppStatus = false;
          //if no internet or something, find posible stored trips
          this.findUnfinishedTravel();
        };
      }
    } else {
      console.info('La app ya se esta actualizando..');
    }
  }

  ionViewWillUnload() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  isConnected(): boolean {
    let conntype = this.network.type;
    if (conntype == null) {
      //If the state can't be known, the de warning is not shown
      return true;
    } else {
      return conntype && conntype !== "unknown" && conntype !== "none";
    }
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  /**Verifica si se cerro la app durante un viaje y lo restaura */
  private findUnfinishedTravel() {

    let data = this.storageService.getData(StorageKeyEnum.currentTravel)

    if (data) {
      this.travelService
        .normalizeTravelValues(data, true)
        .then((travelStatus: TravelStatusEnum) => {
          this.goToPageByTravelStatus(travelStatus);
        })
        .catch((error) => {
          console.info(error.message);
          console.warn(error.error);
        });
    }

    return data

    /*return this.storageService
      .getData(StorageKeyEnum.currentTravel)
      .then((data) => {
        if (data) {
          this.travelService
            .normalizeTravelValues(data, true)
            .then((travelStatus: TravelStatusEnum) => {
              this.goToPageByTravelStatus(travelStatus);
            })
            .catch((error) => {
              console.info(error.message);
              console.warn(error.error);
            });
        }
      });*/
  }

  checkConnection() {
    if (this.isConnected()) {
      this.travelService.showLostConectionMessage = false;
      if (this.router.url.includes("HomePage")) {
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      }
    } else {
      this.travelService.showLostConectionMessage = true;
      if (this.router.url.includes("HomePage")) {
        if (!this.ref['destroyed']) {
          this.ref.detectChanges();
        }
      }
    }
  }

  refresh_connection(): void {
    this.checkConnection();
    if (this.permissionsAllowed && this.router.url.includes("HomePage")) this.loadMap();
  }

  async manualToggleAvailability() {
    try {
      let versionCode = await this.appVersion.getVersionCode();
      console.info(`Numero de version encontrado: ${versionCode}`);
      if (!this.platform.is('android')) {
        versionCode = versionCode.toString().replace(/\./gi, "0") + "0";
        console.info(`Numero de version iOS: ${versionCode}`);
      }

      const state = await this.identityService.checkAppVersionUpdated(this.platform.is('android') ? 'ANDROID' : 'IOS', versionCode);

      switch (state.result) {
        case 'OK':
        case 'RECOMMENDED':
          if (this.identityService.outOfService) {
            await this.identityService.setOutOfService(false);
            this.getAppStatus();
          } else {
            await this.toggleAvailability()
          };
          break;
        case 'REQUIRED':
          await this.toggleAvailability(DriverStateEnum.OFFLINE).then(() => {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                required: true
              }
            };
            this.router.navigate(["OutdatedVersionPage"], { state: { required: true }});
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error in manualToggleAvailability: ', error);
    }
  }

  public toggleAvailability(driverState?: string): Promise<any> {
    //if(this.identityService.operability) {
    console.log("toggleAvailability to driverState:", driverState);

    this.showLoadingAvailability(true);
    let subState;

    //for toggle
    if (driverState == null || driverState == undefined) {
      //switch state
      if (this.checked) {
        driverState = DriverStateEnum.OFFLINE;
        subState = DriverSubStateEnum.IN_STREET;
      } else {
        driverState = DriverStateEnum.ONLINE;
        subState = DriverSubStateEnum.IN_STREET;
      }
    }

    let newState = driverState;
    this.driverStatusClosed = driverState;

    //refresh state on server and firebase
    return this.authenticationService
      .refreshToken(
        this.token,
        this.identityService.userId,
        newState,
        subState,
        null,
        null
      )
      .then((result) => {
        this.identityService.setDriverState(newState);

        if (this.permissionsAllowed) {
          if (driverState == DriverStateEnum.OFFLINE) {
            // Send last position online
            this.navigationService.getCurrentBackgroundPosition().then(location => {
              if (location) this.navigationService.sendNumericLocation(location);
            });
            this.navigationService.stopPositionTracking();
            this.identityService.checkSubState(driverState);
          } else {
            //initiate watch to report location periodically
            this.navigationService.startPositionTracking();

            // Send last position offline
            this.navigationService.getCurrentBackgroundPosition().then(location => {
              if (location) this.navigationService.sendNumericLocation(location);
            });
          }
        }

        this.identityService.setOperability(true);

        if (this.permissionsAllowed) {
          return this.authenticationService
            .getUserInfo(this.connectionServices.getLogUserId()) //to refresh current car mostly
            .then((res) => this.navigationService.getCurrentBackgroundPosition())
            .then((location) => {
              if (location) {
                this.statusService.calculateInBaseRange(
                  location.coords.latitude,
                  location.coords.longitude
                );

                return this.localizationService
                  .getCountryLocaleSettings(
                    this.identityService.countryCode
                      ? this.identityService.countryCode.toLowerCase()
                      : "ar",
                    {
                      lat: location.coords.latitude,
                      lng: location.coords.longitude,
                    }
                  )
                  .toPromise();
              }

              return Promise.resolve(null);
            })
            .then(() => {
              this.showLoadingAvailability(false);
              this.refreshStatusButton();
              this.checkConnection();
              if (this.router.url.includes("HomePage")) {
                if (!this.ref['destroyed']) {
                  this.ref.detectChanges();
                }
              }
            });
        } else {
          return;
        }
      })
      .catch((err) => {
        console.error(err);

        switch (err.status) {
          case 400: {
            console.log("err.status == 400");
            this.identityService.setOperability(false);
            this.alertService.show(
              this.t("home.atention_title"),
              this.t("connection_service.error_400")
            );
            break;
          }
          case 428: {
            if (err.message == "DRIVER_NOT_IN_TRAVEL") {
              //Espacio por si deciden finalmente agregar un cartel de mensaje
            } else {
              console.log("err.status == 428");
              this.alertService.show(
                this.t("home.atention_title"),
                this.t("home.not_vehicle_assigned")
              );
            }

            break;
          }
          case 409: {
            console.log("err.status == 409 drivers concurrency");
            const concurrencyMsg = {
              domain: this.identityService.currentCar.substr(0, this.identityService.currentCar.indexOf(" ")),
              name: err.message
            };
            this.alertService.show(
              this.t("home.atention_title"),
              this.translateService.instant("home.driver_concurrency", concurrencyMsg)
            );
            break;
          }
          default: {
            this.alertService.show(this.t("home.atention_title"), err.message);
            break;
          }
        }

        this.showLoadingAvailability(false);
        this.refreshStatusButton();
        this.checkConnection();
      });
    //}
  }

  private showLoadingAvailability(show: boolean) {
    if (show) {
      this.showSpinnerClass = "showSpinner";
      this.showSpinner = true;
      this.available = this.checked;
    } else {
      this.showSpinnerClass = "";
      this.showSpinner = false;
      this.available = this.checked;
    }
  }

  private refreshStatusButton() {
    //show loading spinner if refreshing status and the carrier splash overlay is hidden
    this.checked =
      this.identityService.driverState == DriverStateEnum.ONLINE &&
        this.identityService.operability
        ? true
        : false;
    console.log("refreshStatusButton checked:", this.checked);

    this.available = this.checked;
    this.availableClass = this.checked ? "availableClass" : "";

    let iconImg = "assets/images/icono-car-destination.png";
    if (!this.checked) {
      iconImg = "assets/images/icono-car-origin.png";
    }
    if (this.carMarker != null) {
      let icon = L.icon({
        iconUrl: iconImg,
        iconSize: [32, 42],
        iconAnchor: [16, 42]
      })
      this.carMarker.setIcon(icon);

    }
  }

  private showLoadingMap(show: boolean) {
    if (show) {
      this.showMapSpinnerClass = "showSpinner";
    } else {
      this.showMapSpinnerClass = "";
    }
  }

  private loadMap() {
    this.showLoadingMap(true);

    this.navigationService
      .getCurrentBackgroundPosition()
      .then((location) => {
        console.log("BACKGROUND >>>>>>>>>>>>>> ", location)
        console.log("BACKGROUND >>>>>>>>>>>>>> ", location)
        console.log("BACKGROUND >>>>>>>>>>>>>> ", location)
        console.log("BACKGROUND >>>>>>>>>>>>>> ", location)
        if (location)
          this.getCurrentPositionCallback(
            location.coords.latitude.toString(),
            location.coords.longitude.toString()
          );
      })
      .catch((err) => {
        console.error("Error al obtener la ubicacion en iOS", err);
        this.showLoadingMap(false);


        let cancelAction = function () {
          this.alertService.showingMessage = false;
          ApiInterceptor.repeticionEnCurso.next(false);
          if (this.navCtrl.getActive().id !== "TravelResumePage") {
            if (this.platform.is("Android")) {
              this.platform.exitApp();
            } else {
              retryAction();
            }
          }
        };

        let retryAction = function () {
          this.alertService.showingMessage = false;
          ApiInterceptor.repeticionEnCurso.next(true);
          this.refresh_connection();
        };

        this.alertService.dialog(
          this.t("home.atention_title"),
          this.t("home.no_gps_message"),
          this.t("buttons.retry"),
          this.t("buttons.cancel"),
          retryAction,
          cancelAction
        );
      });
  }

  getCurrentPositionCallback(latitude: string, longitude: string) {
    console.log("getCurrentPositionCallback", latitude, longitude);
    //this.setShortName(latitude, longitude);
    //Open street map
    //inicialize map
    var osmUrl = 'https://{s}.tile.openstreetmap.de/{z}/{x}/{y}.png',
      osmAttrib = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors. Published under <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a >',
      osm = L.tileLayer(osmUrl, { maxZoom: 18, attribution: osmAttrib });

    if (document.getElementById('map')) {
      try {
        // Si el mapa esta inicializado lo elimino
        if (this.map != undefined) {
          this.map.off();
          this.map.remove();
        }

        this.map = L.map('map', {
          zoom: 15,
          zoomControl: false
        }).addLayer(osm).setView([+latitude, +longitude])/*.locate({setView:true})*/;
        this.map.invalidateSize();

        //Defino los markers
        let iconImg = "assets/images/icono-car-destination.png";
        if (!this.checked) {
          iconImg = "assets/images/icono-car-origin.png";
        }
        let latLng = [+latitude, +longitude];
        this.carMarker = L.marker(latLng,
          {
            icon: L.icon({
              iconUrl: iconImg,
              iconSize: [32, 42],
              iconAnchor: [16, 42]
            })
          }
        );
        this.carMarker.addTo(this.map);
        this.loadAllCircles();
      } catch (err) {
        console.error(err);
      }
    }

    this.showLoadingMap(false);
  }

  drawRefreshedMap(latitude: string, longitude) {
    if (this.carMarker != null) {
      /*
      let location = new google.maps.LatLng(+latitude, +longitude);
      this.map.panTo(location);
      this.carMarker.setPosition(location);*/
      let iconImg = "assets/images/icono-car-destination.png";
      if (!this.checked) {
        iconImg = "assets/images/icono-car-origin.png";
      }
      let latLng = [+latitude, +longitude];
      this.carMarker = L.marker(latLng,
        {
          icon: L.icon({
            iconUrl: iconImg,
            iconSize: [32, 42],
            iconAnchor: [16, 42]
          })
        }
      );
      this.carMarker.addTo(this.map);
    }
  }

  private initializeToken(token): void {
    console.log("EL TOKEN", token);
    this.token = token;

    this.firebaseReady = true;
    this.firebaseService.setFirebaseToken(token);
  }

  private firebaseStartUp() {
    if (!this.firebaseReady) {
      this.firebaseService
        .getFirebaseToken()
        .then((token) => {
          if (token == null) {
            (this.firebaseService.onTokenRefresh() as any).pipe(takeUntil(this.destroy$)).subscribe((data) => {
              this.initializeToken(data);
            });
          } else {
            this.initializeToken(token);
          }
        })
        .catch((err) => {
          //this.toggleAvailability(DriverStateEnum.OFFLINE);
        });

      (this.firebaseService.onNotification() as any).pipe(takeUntil(this.destroy$)).subscribe(
        (data) => {
          console.log("EXISTE NOTIFICACION !!!! ", data)
          console.info("[Firebase Service]: Processing new notification...");
          console.log(data);
          const notification = this.getNotificationData(data);
          if (notification) this.manageNotification(notification);
        },
        function (msg) { }
      );
    }
  }

  private manageNotification(notification) {
    console.log("NOTIFICACION !!!! ", notification)
    console.log("NOTIFICACION !!!! ", notification)
    console.log("NOTIFICACION !!!! ", notification)
    console.log("NOTIFICACION !!!! ", notification)
    console.log("NOTIFICACION !!!! ", notification)
    if (notification.notificationIdentifier === "TRAVEL_FINISHED") {
      if (notification.travelId === this.travelService.currentTravel.travelId)
        this.notifyCurrentTripFinished();
    } else if (notification.notificationIdentifier === "TRAVEL_CANCELLED") {
      if (notification.travelId === this.travelService.currentTravel.travelId)
        this.notifyCurrentTripCancelled();
    } else if (
      notification.notificationIdentifier === "TRAVEL_SCHEDULED_CANCELLED"
    ) {
      this.notifyScheduleTripCancelled(notification.travelId);
    }

    if (notification.notificationIdentifier === "TRAVEL_UPDATED") {
      if (notification.travelId === this.travelService.currentTravel.travelId)
        this.notifyUpdatedCurrentTrip();
    }

    if (notification.notificationIdentifier == "DRIVER_UNASSIGNED") {
      // TRAVEL UNASSIGNED.
      if (notification.travelId === this.travelService.currentTravel.travelId)
        this.currentTripUnassigned();
    }

    if (notification.wasTapped) {
      //background
      if (notification.notificationIdentifier === "TRAVEL_PROGRAMMED") {
        //console.log("TRAVEL_PROGRAMMED background");
        if (
          this.router.url.includes("HomePage") ||
          this.router.url.includes("SettingsPage")
        ) {
          //console.log("push(TravelListPage)");
          this.router.navigate(["TravelListPage", { data: "FROM_NOTIFICATION" }]);
        }
      }
    } else {
      //foreground
      if (notification.state === "WITH_DRIVER_ASSIGNED") {
        this.goToTravelConfirmPage(notification.travelId); //only an attempt, it executes only if its not already on travelConfirmPage
      }

      if (notification.notificationIdentifier === "TRAVEL_PROGRAMMED") {
        //console.log("TRAVEL_PROGRAMMED foreground");

        //view
        let confirmAction = function () {
          this.alertService.showingMessage = false;
          if (
            this.router.url.includes("HomePage") ||
            this.router.url.includes("SettingsPage")
          ) {
            //console.log("push(TravelListPage)");
            this.router.navigate(["TravelListPage", { data: "FROM_NOTIFICATION" }]);
          }
        };
        //ok
        let cancelAction = function () {
          this.alertService.showingMessage = false;
        };
        this.alertService.dialog(
          "",
          this.t("home.scheduled_trip_dialog"),
          this.t("buttons.view"),
          this.t("buttons.close"),
          confirmAction,
          cancelAction
        );
      }

      if (notification.notificationIdentifier == 'NEW_CHAT_MESSAGE') {
        if (this.travelService.currentTravel && !this.router.url.includes("TravelChatPage"))
          this.chatService.setUnreadMessages(true);
      }
    }
  }

  private getNotificationData(dataContent: any): any {
    try {
      if (!dataContent) return null;
      if (!dataContent.body) return null;
      const data = JSON.parse(dataContent.body);
      const notificationData = {
        wasTapped: dataContent.wasTapped,
        travelId: data.travelId,
        state: data.state,
        notificationIdentifier: data.notificationIdentifier,
      };
      console.info(
        "[Firebase Service]: Notification processed...",
        JSON.stringify(notificationData)
      );
      return notificationData;
    } catch (error) {
      return null;
    }
  }

  goToTravelConfirmPage(travelId: number): void {
    this.travelService.removeCurrentTravel();
    if (!this.router.url.includes('TravelConfirmPage')) {
      this.statusService.getIncomingTripData(travelId).then((travel) => {
        this.storageService.setData(StorageKeyEnum.travelCancellation, travel.travelCancellation);
        this.router.navigate(['TravelConfirmPage', { data: travel }]);
      });
    }
  }

  /**
   * Determina a donde debe navegar dependiendo el estado del viaje.
   * @param travelStatus : TravelStatusEnum
   */
  private async goToPageByTravelStatus(travelStatus: TravelStatusEnum): Promise<void> {
    switch (travelStatus) {
      case TravelStatusEnum.travelToStart:
        !this.router.url.includes("TravelToStartPage") && this.router.navigate(["TravelToStartPage"]);
        break;
      case TravelStatusEnum.travelInProgress:
        !this.router.url.includes("TravelInProgressPage") && this.router.navigate(["TravelInProgressPage"]);
        break;
      case TravelStatusEnum.travelResume:
        if (!this.unsynchronizedTravels)
          !this.router.url.includes("TravelResumePage") && this.router.navigate(["TravelResumePage"]);
        break;
      default:
        this.storageService.deleteData(StorageKeyEnum.currentTravel);
        break;
    }
  }

  notifyCurrentTripFinished(): void {
    if (this.alertService.alert) this.alertService.alert.dismiss();
    //current trip cancelled
    this.alertService.show(
      this.t("home.finalized_trip_title"),
      this.t("home.finalized_trip_message")
    );
    ////this.navCtrl.popToRoot();
    this.router.navigate(['HomePage']);
    this.router.navigate(['HomePage']);
    this.identityService.setDriverState(DriverStateEnum.ONLINE);
    this.travelService.removeCurrentTravel();
  }

  notifyCurrentTripCancelled(): void {
    //current trip cancelled
    this.alertService.show(
      this.t("home.canceled_trip_title"),
      this.t("home.canceled_trip_message")
    );
    ////this.navCtrl.popToRoot();
    this.router.navigate(['HomePage']);
    this.router.navigate(['HomePage']);
    this.identityService.setDriverState(DriverStateEnum.ONLINE);
    this.travelService.removeCurrentTravel();
  }

  notifyScheduleTripCancelled(travelId: number): void {
    this.alertService.show(
      this.t("home.canceled_trip_title"),
      this.translateService.instant(
        "home.canceled_scheduled_trip_message",
        { value: travelId }
      )
    );

    if (travelId === this.travelService.currentTravel.travelId) {
      //this.navCtrl.popToRoot();
      this.router.navigate(['HomePage']);
      this.identityService.setDriverState(DriverStateEnum.ONLINE);
      this.travelService.removeCurrentTravel();
    }
  }

  /**
   *
   * @param travelId Interpolate params for translate service.
   */
  private currentTripUnassigned() {
    this.identityService.setDriverState(DriverStateEnum.ONLINE);
    this.travelService.removeCurrentTravel();

    if (!this.router.url.includes("HomePage")) {
      //this.navCtrl.popToRoot();
      this.router.navigate(['HomePage']);
    }
  }

  notifyUpdatedCurrentTrip() {
    //current trip updated (informed by notification)
    this.alertService.show(
      this.t("home.udpated_trip_title"),
      this.t("home.updated_trip_message")
    );

    if (this.travelService.currentTravel.travelStatus !== TravelStatusEnum.travelInProgress
      && this.travelService.currentTravel.travelStatus !== TravelStatusEnum.travelResume
    ) {
      this.travelService.removeCurrentTravel();
      //this.navCtrl.popToRoot();
      this.router.navigate(['HomePage']);
    }
  }

  hideOverlay() {
    this.overlayHidden = true;
  }

  private cleanCircles() {
    if (this.circles) {
      this.circles.forEach((c) => {
        c.removeFrom(this.map);
      });
      this.circles.fill(null);
    }
    this.circles = [];
  }

  private async loadAllCircles() {
    try {
      const show = await this.storageService.getData(StorageKeyEnum.showCarrierCircle);
      const bases = this.identityService.carrierPlaces;
      this.cleanCircles();
      if (show) {
        this.circles = bases.map((base) => {
          const isRealBase = base.branchType === BranchTypeEnum.PHYSICAL;
          return this.getCircle(
            +base.locationPlace.latitude,
            +base.locationPlace.longitude,
            isRealBase
          );
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  private getCircle(lat: number, lng: number, isRealBase = false): L.circle {
    const radius = +this.identityService.getBaseScope();
    let circleOption = {
      color: isRealBase ? "#276593" : "#F54789",
      opacity: 0.3,
      weight: 2,
      fillColor: isRealBase ? "#276593" : "#F54789",
      fillOpacity: 0.35,
      radius: radius
    };

    const circle = L.circle([lat, lng], circleOption).addTo(this.map);
    return circle;
  }

  async checkAppVersionUpdated() {
    if (!this.activatesRoute.snapshot.params["FROM_UPDATE_WARNING"]) {

      let versionCode = await this.appVersion.getVersionCode();
      console.info(`Numero de version encontrado: ${versionCode}`);
      if (!this.platform.is('android')) {
        versionCode = versionCode.toString().replace(/\./gi, '0');
        console.info(`Numero de version IOS encontrado: ${versionCode}`)
      }
      const state = await this.identityService.checkAppVersionUpdated(this.platform.is('android') ? "ANDROID" : "IOS", versionCode);
      let navigationExtras: NavigationExtras = {
        queryParams: {
          required: false
        }
      };
      switch (state.result) {
      case 'RECOMMENDED':
          navigationExtras = {
            queryParams: {
              required: false
            }
          };
          this.router.navigate(["OutdatedVersionPage"], { state: { required: false }});
          break;
        case 'REQUIRED':
          await this.toggleAvailability(DriverStateEnum.OFFLINE);
          navigationExtras = {
            queryParams: {
              required: true
            }
          };
          this.router.navigate(["OutdatedVersionPage"], { state: { required: true }});
          break;
        default:
          break;
      }
    }
  }

  startStreetTravel(): void {
    /* Touch Cancel Button **/
    const cancelButton = () => {
      this.alertService.showingMessage = false;
    };
    /* Touch Acept Button **/
    const aceptButton = async () => {
      this.loadingService.show();
      try {
        await this.navigationService.clearTransistorPointsBuffer();
        this.travelService.currentTravel = new CurrentTravelModel();
        this.travelService.currentTravel.routeWaypoints = [];
        this.travelService.currentTravel.origRouteWaypoints = [];
        /* Get Latitude and Longitude **/
        const location = await this.navigationService.getActualPosition();

        this.travelService.pickUpPoint = new RouteWaypointModel({ "lat": location.coords.latitude, "lng": location.coords.longitude }, 1, 1, location.timestamp);
        this.travelService.savePickUpPointToStorage();
        this.travelService.currentTravel.routeWaypoints.push(this.travelService.pickUpPoint);

        /* Call service start street travel **/
        const response = await this.travelService.startStreetTravel(this.identityService.carrierUserId, {
          /* Set paramas to service **/
          driverId: +this.identityService.userId,
          lat: this.travelService.pickUpPoint.location.lat.toString(),
          lng: this.travelService.pickUpPoint.location.lng.toString(),
          vehicleId: this.identityService.vehicleId,
          originPlatform: this.identityService.userType,
          originToken: this.firebaseService._firebaseToken || 'INVALID_TOKEN'
        });
        this.travelService.generateAuditInfo();
        console.log('Response Street Travel ->', response)
        this.refresh_connection();
        this.updatingAppStatus = false;
        this.travelService.isStreetPassengerTravel = true;
        this.travelService.saveCurrentTravel();
        await this.getAppStatus();
        this.loadingService.hide()
      } catch (error) {
        this.loadingService.hide();
        this.alertService.showingMessage = false;
        this.alertService.dialog(
          null,
          this.t("travel_to_start.function_not_available"),
          this.t("buttons.ok"),
          null,
          () => { this.alertService.showingMessage = false },
          null
        );
        throw new Error(error);
      }

      this.alertService.showingMessage = false;
    };

    this.alertService.dialog(
      null,
      this.t("travel_to_start.start_street_message"),
      this.t("buttons.ok"),
      this.t("buttons.cancel"),
      aceptButton,
      cancelButton
    );
  }

  driverOnTripAlert(): void {
    this.alertService.dialog(
      null,
      this.t("home.driver_on_trip"),
      this.t("buttons.ok"),
      null,
      () => { this.alertService.showingMessage = false },
      null
    );
  }


  /*
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
    LOGICA DE COMPONENTE DE DRIVER  /////// RESERV
  */

  getHomeUserInformation() {
    this.homeUserInformation.fullName = this.identityService.fullName;
    this.identityService.getFullName.subscribe(fullName => {
      this.homeUserInformation.fullName = fullName;
    });
    
    this.homeUserInformation.profilePhoto = this.identityService.imageLogo;
    this.identityService.getImageLogo.pipe(takeUntil(this.destroy_c$)).subscribe(image => this.homeUserInformation.profilePhoto = image);

    this.homeUserInformation.carrierLogo = this.identityService.carrierImageLogo;
    this.identityService.getCarrierImageLogo.pipe(takeUntil(this.destroy_c$)).subscribe(image => this.homeUserInformation.carrierLogo = image);

    this.homeUserInformation.carrierCode = this.identityService._carrierCode;
    this.identityService.getCarrierCode.pipe(takeUntil(this.destroy_c$)).subscribe(carrierCode => this.homeUserInformation.carrierCode = carrierCode);

    this.homeUserInformation.carrierName = this.identityService._carrierName;
    this.identityService.getCarrierName.pipe(takeUntil(this.destroy_c$)).subscribe(carrierName => this.homeUserInformation.carrierName = carrierName);

    this.homeUserInformation.currentVehicle = this.identityService.currentCar;
    this.identityService.getCurrentCar.pipe(takeUntil(this.destroy_c$)).subscribe(currentVehicle => this.homeUserInformation.currentVehicle = currentVehicle);

    this.homeUserInformation.currentVehicleType = this.identityService.currentCarType;
    this.identityService.getCurrentCarType.pipe(takeUntil(this.destroy_c$)).subscribe(currentVehicleType => this.homeUserInformation.currentVehicleType = currentVehicleType);
    
    try{
      this.homeBaseInformation.currentBaseName = this.identityService.currentBase.branchName;
      this.homeBaseInformation.currentBaseName = this.identityService.currentBase.branchName.length >= 25 ? this.identityService.currentBase.branchName.substring(0, 24) + '...' : this.identityService.currentBase.branchName
    }catch(e){
      this.homeBaseInformation.currentBaseName = "";
    }
    
    this.identityService.getCurrentBase.pipe(takeUntil(this.destroy_c$)).subscribe(currentBaseName => {
      if (currentBaseName && currentBaseName.branchName)
        this.homeBaseInformation.currentBaseName = currentBaseName.branchName.length >= 25 ? currentBaseName.branchName.substring(0, 24) + '...' : currentBaseName.branchName
      else
        this.homeBaseInformation.currentBaseName = '';
    });


    this.refreshSubState(this.identityService.driverSubState);
    this.identityService.getDriverSubstate.pipe(takeUntil(this.destroy_c$)).subscribe(subState => this.refreshSubState(subState));

    this.statusService.getQueuePositionInBase().pipe(takeUntil(this.destroy_c$)).subscribe(inBasePosition => {
      if (inBasePosition && inBasePosition.positionInBase && inBasePosition.totalDriversInBase) {
        this.homeBaseInformation.positionInBase = inBasePosition.positionInBase;
        this.homeBaseInformation.totalDriversInBase = inBasePosition.totalDriversInBase;
      } else {
        this.homeBaseInformation.positionInBase = null;
        this.homeBaseInformation.totalDriversInBase = null;
      }
    });

    if (this.homeUserInformation.profilePhoto == null) {
      this.homeUserInformation.profilePhoto = "assets/images/avatar/default-user-img.png";
    }

    this.statusService.setDriverSubstate.pipe(takeUntil(this.destroy_c$)).subscribe(isInBaseRange => {
      if (
        this.homeBaseInformation.inBase &&
        !isInBaseRange &&
        this.identityService.driverSubState === DriverSubStateEnum.IN_BASE
      ) {
        this.setInBase();
      }
      this.homeBaseInformation.inBaseRange = isInBaseRange;
    });

  }

  setInBase() {
    if (!this.homeBaseInformation.inBase && !this.homeBaseInformation.inBaseRange) return;

    this.showLoadingInBase(true);

    let inBaseState = this.homeBaseInformation.inBaseChecked ? DriverSubStateEnum.IN_STREET : DriverSubStateEnum.IN_BASE;

    const token = this.firebaseService._firebaseToken;
    const state = this.identityService.driverState;
    let latitude;
    let longitude;

    this.navigationService.getCurrentBackgroundPosition().then(location => {
      latitude = location.coords.latitude.toString();
      longitude = location.coords.longitude.toString();
      this.statusService.calculateInBaseRange(latitude, longitude);
      // Se refresca el estado en base de datos y firebase
      this.authenticationService.refreshToken(
        token,
        this.identityService.userId,
        state, inBaseState,
        latitude,
        longitude
      ).then(() => {
        this.identityService.setDriverSubState(inBaseState);
        this.showLoadingInBase(false);
        this.refreshSubStatusButton();
      }).catch(err => {
        console.error(err);
        this.alertService.show(this.t("home.atention_title"), this.t("menu.errorInBase"));
        this.showLoadingInBase(false);
        this.refreshSubStatusButton();
      });
    }).catch(err => {
      console.error("Error al obtener la ubicacion en iOS", err);
      let vm = this;
      let cancelAction = function () {
        vm.alertService.showingMessage = false;
        ApiInterceptor.repeticionEnCurso.next(false);
      };
      let retryAction = function () {
        vm.alertService.showingMessage = false;
      };

      this.alertService.dialog(this.t("home.atention_title"), this.t("home.no_gps_message"), this.t("buttons.retry"), this.t("buttons.cancel"), retryAction, cancelAction);
    });
  }

  private refreshIsInRange() {
    this.navigationService.getCurrentBackgroundPosition().then(location => {
      if (location) {
        const latitude = location.coords.latitude;
        const longitude = location.coords.longitude;
        this.statusService.calculateInBaseRange(latitude, longitude);
      }
    }).catch(err => {
      console.error("Error al verificar cercania a base");
      console.error(err);
    });
  }

  private refreshSubState(subState) {
    this.homeBaseInformation.inBase = subState == DriverSubStateEnum.IN_BASE ? true : false;
    this.homeBaseInformation.inBaseChecked = this.identityService.driverSubState == DriverSubStateEnum.IN_BASE;
  }

  private refreshSubStatusButton() {
    this.homeBaseInformation.inBaseChecked = this.identityService.driverSubState == DriverSubStateEnum.IN_BASE ? true : false;
    this.homeBaseInformation.inBase = this.homeBaseInformation.inBaseChecked;
  }

  private showLoadingInBase(show: boolean) {
    if (show) {
      this.showSpinner = true;
      this.available = this.checked;
    } else {
      this.showSpinner = false;
      this.available = this.checked;
    }
  }

  ngOnDestroy() {
    this.destroy_c$.next(true);
    this.destroy_c$.unsubscribe();
  }

  async openModalConfirm(){
    

      const tollModal = await this.modalCtrl.create({
        component: TravelConfirmPage,
        cssClass: 'popUp-Modal modalToll',
      });

      tollModal.onDidDismiss().then((data: any) => {
     /*  if(data) {
        this.loadingService.show(this.t('travel_resume.dialogs.update_travel'));
        this.travelService.saveNewToll(data);
        this.calculateCost()
          .then(() => {
            setTimeout(() => {
              this.loadingService.hide();
              this.refresh();
            }, 1000);
          })
          .catch(() => this.loadingService.hide());
        this.refresh();
      }*/
    });

    return await tollModal.present();



  }
}
