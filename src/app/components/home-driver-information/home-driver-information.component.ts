import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { ApiInterceptor } from '../../services/api.interceptor';
import { AuthenticationService } from '../../services/authentication.service';
import { AlertsService } from '../../services/common/alerts.service';
import { DriverStateEnum } from '../../services/enum/driver-state.enum';
import { DriverSubStateEnum } from '../../services/enum/driver-sub-state.enum';
import { FirebaseService } from '../../services/firebase.service';
import { IdentityService } from '../../services/identity.service';
import { NavigationService } from '../../services/navigation.service';
import { StatusService } from '../../services/status.service';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'home-driver-information',
  templateUrl: './home-driver-information.component.html'
})

export class HomeDriverInformationComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

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

  showSpinner: boolean = false;
  checked: boolean = false;
  available: boolean = false;

  constructor(
    private identityService: IdentityService,
    private statusService: StatusService,
    private firebaseService: FirebaseService,
    private navigationService: NavigationService,
    private authenticationService: AuthenticationService,
    private alertService: AlertsService,
    private translateService: TranslateService
  ) {}

  ngOnInit() {
    this.getHomeUserInformation();
    setInterval(() => {
      if(
        this.identityService.driverState === DriverStateEnum.ONLINE &&
        this.identityService.driverSubState === DriverSubStateEnum.IN_STREET
      ) this.refreshIsInRange();
    }, 60000);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getHomeUserInformation() {
    this.identityService.getFullName.pipe(takeUntil(this.destroy$)).subscribe(fullName => this.homeUserInformation.fullName = fullName);
    this.identityService.getImageLogo.pipe(takeUntil(this.destroy$)).subscribe(image => this.homeUserInformation.profilePhoto = image);
    this.identityService.getCarrierImageLogo.pipe(takeUntil(this.destroy$)).subscribe(image => this.homeUserInformation.carrierLogo = image);
    this.identityService.getCarrierCode.pipe(takeUntil(this.destroy$)).subscribe(carrierCode => this.homeUserInformation.carrierCode = carrierCode);
    this.identityService.getCarrierName.pipe(takeUntil(this.destroy$)).subscribe(carrierName => this.homeUserInformation.carrierName = carrierName);
    this.identityService.getCurrentCar.pipe(takeUntil(this.destroy$)).subscribe(currentVehicle => this.homeUserInformation.currentVehicle = currentVehicle);
    this.identityService.getCurrentCarType.pipe(takeUntil(this.destroy$)).subscribe(currentVehicleType => this.homeUserInformation.currentVehicleType = currentVehicleType);
    this.identityService.getCurrentBase.pipe(takeUntil(this.destroy$)).subscribe(currentBaseName => {
      if(currentBaseName && currentBaseName.branchName)
        this.homeBaseInformation.currentBaseName = currentBaseName.branchName.length >= 25 ? currentBaseName.branchName.substring(0,24) + '...' : currentBaseName.branchName
      else
        this.homeBaseInformation.currentBaseName = '';
    });
    this.identityService.getDriverSubstate.pipe(takeUntil(this.destroy$)).subscribe(subState => this.refreshSubState(subState));
    this.statusService.getQueuePositionInBase().pipe(takeUntil(this.destroy$)).subscribe(inBasePosition => {
      if(inBasePosition && inBasePosition.positionInBase && inBasePosition.totalDriversInBase) {
        this.homeBaseInformation.positionInBase = inBasePosition.positionInBase;
        this.homeBaseInformation.totalDriversInBase = inBasePosition.totalDriversInBase;
      } else {
        this.homeBaseInformation.positionInBase = null;
        this.homeBaseInformation.totalDriversInBase = null;
      }
    });

    if(this.homeUserInformation.profilePhoto == null) {
      this.homeUserInformation.profilePhoto = "assets/images/avatar/default-user-img.png";
    }

    this.statusService.setDriverSubstate.pipe(takeUntil(this.destroy$)).subscribe(isInBaseRange => {
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
      let cancelAction = function() {
        vm.alertService.showingMessage = false;
        ApiInterceptor.repeticionEnCurso.next(false);
      };
      let retryAction = function() {
        vm.alertService.showingMessage = false;
      };

      this.alertService.dialog(this.t("home.atention_title"), this.t("home.no_gps_message"), this.t("buttons.retry"), this.t("buttons.cancel"), retryAction, cancelAction);
    });
  }

  private refreshIsInRange() {
    this.navigationService.getCurrentBackgroundPosition().then(location => {
      if(location) {
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

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }
}
