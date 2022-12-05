import { Component, ChangeDetectorRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { TravelService } from '../../services/travel.service';
import { AlertsService } from '../../services/common/alerts.service';
import { IdentityService } from '../../services/identity.service';
import { IPayTravelCommandParameters, CardDetail } from '../../services/connection/command/payTravel.command';
import { LoadingService } from '../../services/loading-service';
import {
  PaymentMethodValueEnum,
  PaymentMethodLabelEnum
} from '../../services/enum/paymentMethod';
import { RateEngineService } from '../../services/engines/rateEngine.service';
import { PriceUnitEnum } from '../../services/engines/rules/price-unit.enum';
import { NavigationService } from '../../services/navigation.service';
import { TranslateService } from '@ngx-translate/core';
import { SignBase64Provider } from '../../providers/sign-base64/sign-base64';
import { StatusBar } from '@awesome-cordova-plugins/status-bar/ngx';
import { TollDetailItemModel } from '../../models/toll-detail-item.model';
import { ParkingDetailItemModel } from '../../models/parking-detail-item.model';
import { TravelTotalDetailedCostModel } from '../../models/travel-total-detailed-cost.model';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { MercadopagoCard } from '../../services/mercadopago/mercadopago-api-interfaces';
import { LocalizationService } from '../../services/localization/localization.service';
import { OtherCostDetailItemModel } from '../../models/other-cost-detail-item.model';
import { Subject } from 'rxjs';
import { StatusService } from '../../services/status.service';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';
import { IGetQrPaymentResponse } from '../../services/connection/command/getQrPayment.command';
import { RouteWaypointModel } from '../../models/routeWaypoint.model';
import { filter, pairwise, takeUntil } from 'rxjs/operators';
import { NavController, Platform, MenuController, ModalController, AlertInput,IonContent } from '@ionic/angular';
import { CreditCardPaymentDataComponent } from 'src/app/components/credit-card-payment-data/credit-card-payment-data.component';
import { SignerPage } from '../signer/signer';
import { TravelAddTollModal } from '../travel-add-toll/travel-add-toll';
import { TravelAddParkingModal } from '../travel-add-parking/travel-add-parking';
import { TravelAddOtherCostModal } from '../travel-add-other/travel-add-other';
import { Router, RoutesRecognized } from '@angular/router';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { PopPictureComponent } from 'src/app/components/pop-picture/pop-picture';
import { QRPaymentModal } from 'src/app/components/qr-payment-modal/qr-payment-modal';

declare var google: any;

@Component({
  selector: 'app-travel-resume',
  templateUrl: 'travel-resume.html',
  styleUrls:['travel-resume.scss'],
  // animations: [
  //   trigger('fadeIn', [
  //     transition(':enter', [
  //       style({ opacity: '0' }),
  //       animate('.5s ease-out', style({ opacity: '1' })),
  //     ]),
  //   ]),
  // ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelResumePage {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild(IonContent) ionContent: IonContent;
  @ViewChild(PopPictureComponent) popPicture : PopPictureComponent;

  text: string = '';
  paymentMethod: string = '';
  isVisibleEmergencyButton = true;
  highlightAddresses: boolean = true;
  canGoBack: boolean = false;

  isClosed=false;

  travel: CurrentTravelModel;
  tollList: TollDetailItemModel[] = new Array<TollDetailItemModel>();
  parkingList: ParkingDetailItemModel[] = new Array<ParkingDetailItemModel>();
  otherCostList: OtherCostDetailItemModel[] = new Array<OtherCostDetailItemModel>();
  tollExpense: number = 0;
  parkingExpense: number = 0;
  otherCostExpense: number = 0;

  paymentMethodShowList: Array<PaymentMethodShow> = new Array<
    PaymentMethodShow
  >();
  selectedPaymentMethodShow: PaymentMethodShow = new PaymentMethodShow();

  frequentDestination: boolean = false;

  travelDetailsVisible: boolean = false;
  cardDetail : CardDetail;
  retryCardData: any;

  labelButtonClose:string;
  mustToSign : boolean=false;
  totalDetailedCosts: TravelTotalDetailedCostModel;
  tripPlusWaitTimeCost;

  constructor(
    private navCtrl: NavController,
    private travelService: TravelService,
    private alertService: AlertsService,
    private identityService: IdentityService,
    private loadingService: LoadingService,
    private rateEngine: RateEngineService,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    private navigationService: NavigationService,
    private menu: MenuController,
    private translateService: TranslateService,
    private signBase64Provider: SignBase64Provider,
    private modalCtrl: ModalController,
    private statusBar: StatusBar,
    private localizationService: LocalizationService,
    private network: Network,
    private statusService: StatusService,
    private storageService: StorageService,
    private router:Router
  ) {}

  refresh() {
   this.ref.markForCheck();
   this.refreshCurrentTravel();
  }

  affiResumeCheck(){
    if (this.travel.affiliateSettings && this.travel.affiliateSettings.type=='ONE_SHOT'){
        this.travel.endTolerancePercent = this.travel.affiliateSettings.oneShotRules.tolerancePercent;
        this.travel.pricePerKM = this.travel.affiliateSettings.oneShotRules.extraKmValue;
        return true;
    } else
        return false;
  }

  ionViewDidEnter() {
    this.travel = this.travelService.currentTravel;
    this.affiResumeCheck(); //Verifica si es un viaje de afiliados y ajusta valores necesarios para el posterior recalculo si se necesitara.
    this.checkHighlightAddresses();
    this.checkCanGoBack();

    this.travelService.tollList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.tollList = res;
      this.refresh();
    });
    this.travelService.parkingList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.parkingList = res;
      this.refresh();
    });
    this.travelService.otherCostList$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.otherCostList = res;
      this.refresh();
    });
    this.travelService.tollExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.tollExpense = res;
      this.refresh();
    });
    this.travelService.parkingExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.parkingExpense = res;
      this.refresh();
    });
    this.travelService.otherCostExpense$.pipe(takeUntil(this.destroy$)).subscribe(res => {
      this.otherCostExpense = res;
      this.refresh();
    });

    this.loadingService.show();
    this.signBase64Provider.signPassengerBase64.next(null);
    this.signBase64Provider.containSign.next(false);

    if (this.travelService.currentTravel.waitMinutes == null) {
      let minutes = 0;
      let seconds = 0;
      this.travelService.currentTravel.waitDetailList.forEach(waitDetailItem => {
        minutes = minutes + waitDetailItem.minutes;
        seconds = seconds + waitDetailItem.seconds;
      });
      this.travelService.currentTravel.waitMinutes = minutes + Math.floor(seconds / 60);
    }

    this.checkFrequentDestination()
      .then( res => this.travelService.currentTravel.isFrecuent = res);

    console.log('currentTravel', this.travelService.currentTravel);
    console.log(
      'this.travelService.currentTravel.waitDetailList',
      this.travelService.currentTravel.waitDetailList
    );

    this.platform.backButton.subscribe(() => { });

    this.fillPaymentMethodCombo();
    this.recalculateRealDistance();
    this.refresh();
  }

  ionViewWillEnter() {
    this.getLabelButton();

    this.menu.enable(false);
    if (this.platform.is('ios')) {
      this.statusBar.backgroundColorByHexString("#54b3a5");
      this.statusBar.overlaysWebView(false);
    }
    this.refresh();
  }

  ionViewDidLeave() {

    if (this.isClosed) {
      this.destroy$.next(true);
      this.destroy$.unsubscribe();
      this.travelService.timerReset();
      this.travelService.removeCurrentTravel();
      this.travelService.clearSubjects();
      this.cardDetail = null;
      this.retryCardData = null;
    }
    if (this.platform.is('ios')) {
      this.statusBar.backgroundColorByHexString("#A63984");
      this.statusBar.overlaysWebView(true);
    }
    this.refresh();
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  public closeTravel() {
    switch (this.selectedPaymentMethodShow.value) {
      case PaymentMethodValueEnum.CASH: {
        this.payTravelChash();
        break;
      }
      case PaymentMethodValueEnum.CHECKING_ACCOUNT: {
        this.payTravelChekingAccount();
        break;
      }
      case PaymentMethodValueEnum.CREDIT_CARD: {
        this.payTravelCreditCard();
        break;
      }
      case PaymentMethodValueEnum.PRESET_CREDIT_CARD: {
        this.signAndPay();
        break;
      }
      case PaymentMethodValueEnum.QR_CODE: {
        this.showQRCode();
      }
    }

    this.refresh();
  }

  getCurrencySymbol() {
    return this.localizationService.localeData
      ? this.localizationService.localeData.currency.symbol
      : '$';
  }

 async payTravelCreditCard() {

const modal = await this.modalCtrl.create({
        component: CreditCardPaymentDataComponent,
        componentProps:{ "amount": this.travelService.currentTravel.totalCostFinal,
         "retryCardData": this.retryCardData,
         "appCode": this.travelService.currentTravel.mercadopagoAppCode }
      });

      modal.onDidDismiss().then((values:any) => {
        if(values) {
        let card: MercadopagoCard = values.card;
        this.cardDetail = {
          token: card.id,
          cardId: card.card_id,
          externalCardId: card.card_id,
          lastFourDigits: card.last_four_digits,
          firstSixDigits: card.first_six_digits,
          expirationYear: card.expiration_year,
          expirationMonth: card.expiration_month,
          issuerId: card.bankId,
          issuerName: card.bank,
          paymentMethodId: card.type,
          paymentTypeId: card.payment_type_id,
          cardholderName: card.cardholder.name,
          cardholderIdentificationNumber: card.cardholder.identification.number,
          cardholderIdentificationType: card.cardholder.identification.type,
          cardNumber: card.card_number,
          cvv:card.cvv
        }

        this.retryCardData = values.retryData;
        this.signAndPay();
      }
      })
  }

  payTravelChash() {
    this.signAndPay();
  }

  payTravelChekingAccount() {
    if (
      this.travelService.currentTravel.checkingAccount != null &&
      this.travelService.currentTravel.checkingAccount.id != 0 &&
      this.travelService.currentTravel.checkingAccount.enabled
    ) {
      if (
        (this.travelService.currentTravel.checkingAccount.balance > 0 &&
          this.travelService.currentTravel.totalCostFinal > this.travelService.currentTravel.checkingAccount.balance) ||
        (this.travelService.currentTravel.checkingAccount.balance <= 0 &&
          this.travelService.currentTravel.checkingAccount.exceedingLimit)
      ) {
        let vm = this;

        let cancelAction = function () {
          vm.alertService.showingMessage = false;
        };

        let confirmAction = function () {
          vm.alertService.showingMessage = false;
          vm.signAndPay();
        };

        this.alertService.dialog(
          this.t('travel_resume.insufficient_balance_title'),
          this.t('travel_resume.insufficient_balance_massage'),
          this.t('buttons.continue'),
          this.t('buttons.cancel'),
          confirmAction,
          cancelAction
        );
      } else if(this.travelService.currentTravel.totalCostFinal > this.travelService.currentTravel.checkingAccount.balance) {
        this.alertService.show(
          this.t('travel_resume.insufficient_balance_title'),
          this.t('travel_resume.insufficient_balance_block_massage')
        );
      } else {
        this.signAndPay();
      }
    } else {
      this.alertService.show(
        this.t('travel_resume.unavailable_account_title'),
        this.t('travel_resume.unavailable_account_message')
      );
    }
  }

  private signAndPay() {
    this.mustToSign = this.calcSignature();
    this.payTravel();
  }

 private async showQRCode() {
    this.loadingService.show();
    this.travelService.getQrPayment({
      carrierId: this.identityService.carrierUserId,
      travelId: this.travelService.currentTravel.travelId.toString(),
      driverId: this.identityService.userId,
      amount: this.travelService.currentTravel.totalCostFinal
    }).then(async (res: IGetQrPaymentResponse) => {
        this.loadingService.hide();

        const qrModal = await this.modalCtrl.create({
          component: QRPaymentModal,
        cssClass: 'popUp-Modal modalToll',
          componentProps:{  enableBackdropDismiss: false }
        });
        qrModal.onDidDismiss().then((confirm) => {
          if(confirm) {
            this.travelService.currentTravel.qrPayment = true;
            this.payTravel();
            }else{
          this.cancelQrCode()
          }
        })

        return await qrModal.present();

      }).catch(err=>{
        this.loadingService.hide();
      });
  }

  private cancelQrCode(){
    this.travelService.cancelQrPayment({
      carrierId: this.identityService.carrierUserId,
      travelId: this.travelService.currentTravel.travelId.toString(),
      driverId: this.identityService.userId
    }).then( response =>{
      return false;
    })
    .catch( err => {
      this.alertService.toast(this.t('travel_resume.qr_payment_done'),5000);
      this.travelService.currentTravel.qrPayment = true;
      this.payTravel();
      return true;
    });
  }

  private calcSignature():boolean{
    const signature = (this.travelService.currentTravel.originPlatform != 'Web'
    ||
    (!this.travelService.currentTravel.requesterUserContractor && this.selectedPaymentMethodShow.value == PaymentMethodValueEnum.CASH))
    ? false : true;
    return signature;
  }

  private getLabelButton(){
    if (this.selectedPaymentMethodShow.value==PaymentMethodValueEnum.CREDIT_CARD){
      this.labelButtonClose = this.t('travel_resume.enter_card');
    }else if (this.calcSignature()){
      this.labelButtonClose = this.t('travel_resume.sign');
    }else{
      this.labelButtonClose =  this.t('travel_resume.close_travel');
    }
  }

  private fillPaymentMethodCombo() {
    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
      this.fillPaymentMethodComboOnline();
    } else {
      this.fillPaymentMethodComboOffline();
    }

    this.network.onChange().pipe(takeUntil(this.destroy$)).subscribe(() => {
      if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
        this.fillPaymentMethodComboOnline();
      } else {
        this.fillPaymentMethodComboOffline();
      }
    });
  }

  private fillPaymentMethodComboOnline() {
    const selectedPaymentMethod = this.selectedPaymentMethodShow;
    let paymentMethodShow0 = new PaymentMethodShow(PaymentMethodValueEnum.CASH, this.t('payment_method.cash'));
    let paymentMethodShow1 = new PaymentMethodShow(PaymentMethodValueEnum.CHECKING_ACCOUNT, this.t('payment_method.checking_account'));
    let paymentMethodShow2 = new PaymentMethodShow(PaymentMethodValueEnum.CREDIT_CARD, this.t('payment_method.credit_card'));
    let paymentMethodShow3 = new PaymentMethodShow(PaymentMethodValueEnum.QR_CODE, this.t('payment_method.qr'));

    const auxPaymentMethodShowList: Array<PaymentMethodShow> = new Array<PaymentMethodShow>();
    if (this.paymentIsEnable(paymentMethodShow0)) auxPaymentMethodShowList.push(paymentMethodShow0);
    if (this.paymentIsEnable(paymentMethodShow1)) auxPaymentMethodShowList.push(paymentMethodShow1);
    if (this.paymentIsEnable(paymentMethodShow2) && this.travelService.currentTravel.mercadoPagoAvailable) auxPaymentMethodShowList.push(paymentMethodShow2);
    if (this.paymentIsEnable(paymentMethodShow2) && this.travelService.currentTravel.mercadoPagoAvailable && this.travelService.currentTravel.mercadopagoAppCode!='STRIPE') auxPaymentMethodShowList.push(paymentMethodShow3);
    this.paymentMethodShowList = auxPaymentMethodShowList;

    if (this.travelService.currentTravel.paymentMethod == PaymentMethodValueEnum.CREDIT_CARD
      && this.travelService.currentTravel.briefCardDetail) this.addPresetCard();

    if(selectedPaymentMethod.value) this.selectedPaymentMethodShow = selectedPaymentMethod;
    else this.setDefaultPaymentMethod();

    this.refresh();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  private fillPaymentMethodComboOffline() {
    const selectedPaymentMethod = this.selectedPaymentMethodShow;
    let paymentMethodShow0 = new PaymentMethodShow(PaymentMethodValueEnum.CASH, this.t('payment_method.cash'));
    let paymentMethodShow1 = new PaymentMethodShow(PaymentMethodValueEnum.CHECKING_ACCOUNT, this.t('payment_method.checking_account'));

    const auxPaymentMethodShowList: Array<PaymentMethodShow> = new Array<PaymentMethodShow>();
    if (this.paymentIsEnable(paymentMethodShow0)) auxPaymentMethodShowList.push(paymentMethodShow0);
    if (this.paymentIsEnable(paymentMethodShow1)) auxPaymentMethodShowList.push(paymentMethodShow1);
    this.paymentMethodShowList = auxPaymentMethodShowList;

    if(!selectedPaymentMethod.value) this.setDefaultPaymentMethod();
    else if(selectedPaymentMethod.value == 'CREDIT_CARD' || selectedPaymentMethod.value == 'PRESET_CREDIT_CARD') {
      this.setDefaultPaymentMethod();
      this.noInternetConnectionAlert();
    }
    else this.selectedPaymentMethodShow = selectedPaymentMethod;

    this.refresh();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  paymentIsEnable(paymentMethod: PaymentMethodShow): boolean {
    let paymentSetting = this.travel.paymentSettings.find( (paymentSetting)=>
      paymentSetting.isEnabled && paymentSetting.paymentMethod === paymentMethod.value
    );
    if (paymentSetting) return true;

    return false;
  }

  private setDefaultPaymentMethod() {
    let defaultPaymentMethodLabel: PaymentMethodLabelEnum | string;
    let defaultPaymentMethodValue: PaymentMethodValueEnum;

    switch (this.travelService.currentTravel.paymentMethod) {
      case PaymentMethodValueEnum.CASH: {
        defaultPaymentMethodLabel = this.t('payment_method.cash');
        defaultPaymentMethodValue = PaymentMethodValueEnum.CASH;
        break;
      }
      case PaymentMethodValueEnum.CHECKING_ACCOUNT: {
        defaultPaymentMethodLabel = this.t('payment_method.checking_account');
        defaultPaymentMethodValue = PaymentMethodValueEnum.CHECKING_ACCOUNT;
        break;
      }
      case PaymentMethodValueEnum.CREDIT_CARD: {
        if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
          defaultPaymentMethodLabel = (this.travelService.currentTravel.briefCardDetail)
            ? this.t('payment_method.credit_card') + " " + this.travelService.currentTravel.briefCardDetail
            : this.t('payment_method.credit_card');
          defaultPaymentMethodValue = (this.travelService.currentTravel.briefCardDetail)
            ? PaymentMethodValueEnum.PRESET_CREDIT_CARD
            : PaymentMethodValueEnum.CREDIT_CARD;
        } else {
          defaultPaymentMethodLabel = this.t('payment_method.cash');
          defaultPaymentMethodValue = PaymentMethodValueEnum.CASH;
        }
        break;
      }
    }
    this.selectedPaymentMethodShow.value = defaultPaymentMethodValue;
    this.selectedPaymentMethodShow.label = defaultPaymentMethodLabel

    this.refresh();
  }

  private addPresetCard(){
    let card = this.travelService.currentTravel.briefCardDetail;
    let paymentMethodShow:PaymentMethodShow  = {
      value: PaymentMethodValueEnum.PRESET_CREDIT_CARD,
      label: card.paymentMethodId.toUpperCase() +" "+this.t("credit-card."+card.paymentTypeId)+" "+card.lastFourDigits
    }
    this.paymentMethodShowList.push(paymentMethodShow);
  }

  changePaymentMethod(paymentMethod: any, paymentMethodSelect: any) {
    if(this.travel.hideAmountsDriver &&
      this.travel.paymentMethod === PaymentMethodValueEnum.CHECKING_ACCOUNT &&
      this.selectedPaymentMethodShow.value === PaymentMethodValueEnum.CHECKING_ACCOUNT &&
      paymentMethod != PaymentMethodValueEnum.CHECKING_ACCOUNT
    ) {
      paymentMethodSelect.value = PaymentMethodValueEnum.CHECKING_ACCOUNT;
      const vm = this;
      const insertCodeConfirmAction = function(alertData) {
        console.log("code: " + alertData.code);
        const code = alertData.code;
        let travelId: string;
        travelId = vm.travelService.currentTravel.travelId.toString();
        travelId = travelId.substr(travelId.length-4);

        console.log("tarvelId: " + travelId);

        if(travelId === code) {
          console.log("code ok");
          vm.selectedPaymentMethodShow.value = paymentMethod;
          if (!this.ref['destroyed']) {
            this.ref.detectChanges();
          }
          vm.alertService.showingMessage = false;
          vm.calculateCost();
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
        vm.t("travel_to_start.insert_code_title"),
        vm.t("travel_to_start.insert_code_message"),
        inputs,
        "geocerca-code-alert-input",
        vm.t("buttons.ok"),
        vm.t("buttons.cancel"),
        insertCodeConfirmAction,
        cancelAction
      );
    } else {
      this.selectedPaymentMethodShow.value = paymentMethod;
    }
    this.getLabelButton();
  }

  calculateCost() {
    this.getLabelButton();
    let serv = this;
    return this.checkFrequentDestination().then(isFrequent => {
      if (this.affiResumeCheck()){
          //SOLO ENTRA SI SE ES UN VIAJE ONESHOT DE AFILIADOS
          console.info("OneShot: Inicio Calculo Costo", serv.travelService.currentTravel);
          serv.travelService.currentTravel.priceWaitTime = serv.travelService.currentTravel.rental
                                                           ? 0 : serv.travelService.currentTravel.priceWaitTime;
          let waitMinutes = serv.travelService.currentTravel.waitMinutes == null || serv.travelService.currentTravel.rental
              ? 0 : serv.travelService.currentTravel.waitMinutes;
          let priceToll = this.calculatePriceToll();
          let priceParking = this.calculatePriceParking();
          let priceOtherCost = this.calculatePriceOtherCost();
          let additionalStops = serv.travelService.currentTravel.additionalStops == null || serv.travelService.currentTravel.rental
              ? 0 : serv.travelService.currentTravel.additionalStops;
          console.info("OneShot: Fin Calculo Adicionales", priceToll, priceParking, priceOtherCost, additionalStops, waitMinutes.toExponential,serv.travelService.currentTravel );

          //this.verifyRoundTrip();
          this.totalDetailedCosts =  serv.rateEngine.calculateOneShotTravelCost(
            serv.travelService.currentTravel.finalDistance,
            priceToll,
            priceParking,
            priceOtherCost,
            additionalStops,
            waitMinutes,
            serv.travelService.currentTravel.km,
            serv.travelService.currentTravel.affiliateSettings.oneShotRules
          );

          this.tripPlusWaitTimeCost = Number(this.totalDetailedCosts.totalCostFinal) - Number(this.totalDetailedCosts.tollPrice) - Number(this.totalDetailedCosts.parkingPrice);
          console.info("OneShot: calculo terminado");
          serv.travelService.setTravelCosts(this.totalDetailedCosts);
          console.info("OneShot: Fin calculo OneShot", serv.travelService.currentTravel, this.totalDetailedCosts);
      } else {
        // Viaje normal
        if (isFrequent) {
          let priceToll = this.calculatePriceToll();
          serv.travelService.currentTravel.priceToll = priceToll;
          this.tollExpense = priceToll;

          let priceParking = this.calculatePriceParking();
          serv.travelService.currentTravel.priceParking = priceParking;
          this.parkingExpense = priceParking;

          let priceOtherCost = this.calculatePriceOtherCost();
          serv.travelService.currentTravel.priceOtherCost = priceOtherCost;
          this.otherCostExpense = priceOtherCost;

          this.refresh();
          if (
            serv.travelService.currentTravel.frequentDestination.priceUnit ==
            PriceUnitEnum.MONEY
          ) {
            serv.travelService.currentTravel.totalCostPartial = serv.travelService.currentTravel.frequentDestination.price;
          } else {
            serv.travelService.currentTravel.totalCostPartial =
              serv.travelService.currentTravel.frequentDestination.price *
              serv.travelService.currentTravel.pricePerKM;
          }

          serv.travelService.currentTravel.totalCostFinal = Math.round(serv.travelService.currentTravel.totalCostPartial + priceToll + priceParking + priceOtherCost);
        } else {
          serv.travelService.currentTravel.priceWaitTime =
            serv.travelService.currentTravel.rental
            ? 0
            : serv.travelService.currentTravel.priceWaitTime;
          let waitMinutes =
            serv.travelService.currentTravel.waitMinutes == null
            || serv.travelService.currentTravel.rental
              ? 0
              : serv.travelService.currentTravel.waitMinutes;
          let priceToll = this.calculatePriceToll();
          let priceParking = this.calculatePriceParking();
          let priceOtherCost = this.calculatePriceOtherCost();

          let additionalStops =
            serv.travelService.currentTravel.additionalStops == null
            || serv.travelService.currentTravel.rental
              ? 0
              : serv.travelService.currentTravel.additionalStops;

          this.verifyRoundTrip();


          this.totalDetailedCosts = serv.rateEngine.calculateTravelCost(
            serv.travelService.currentTravel.finalDistance,
            serv.travelService.currentTravel.finalDistanceReturnTrip,
            serv.travelService.currentTravel.pricePerKM,
            priceToll,
            priceParking,
            priceOtherCost,
            additionalStops,
            waitMinutes,
            serv.selectedPaymentMethodShow.value,
            serv.travelService.currentTravel.roundTrip,
            serv.travelService.currentTravel.km,
            serv.travelService.currentTravel.lastWaypointsDistance,
            serv.travelService.currentTravel.endTolerancePercent,
            serv.travelService.currentTravel.rental,
            serv.travelService.currentTravel.rentHours,
            serv.travelService.currentTravel.rentType,
            serv.travelService.currentTravel.travelDuration,
            serv.travelService.currentTravel.taxiingDistance,
            serv.travelService.currentTravel.lapDistance,
            serv.travelService.currentTravel.taxiingAdjustmentCoeff,
            serv.travelService.currentTravel.rateRules
          );
          this.tripPlusWaitTimeCost = Number(this.totalDetailedCosts.totalCostFinal) - Number(this.totalDetailedCosts.tollPrice) - Number(this.totalDetailedCosts.parkingPrice);

          serv.travelService.setTravelCosts(this.totalDetailedCosts);
        }
      }
      serv.travelService.saveCurrentTravel();
      serv.travel = serv.travelService.currentTravel;
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
    });
  }

  showTicket(item: TollDetailItemModel | ParkingDetailItemModel): void {
    if (item.image) {
      const picture = item.image;
      const caption = `${item.name} $${item.price}`
      this.popPicture.open(picture, caption)
    }
  }

  verifyRoundTrip(){
    if (!this.travelService.currentTravel.roundTrip) return;

    if (this.travelService.currentDestination.id !=
      this.travelService.currentTravel.origin.id){
      this.travelService.currentTravel.roundTripLength = 0;
      this.travelService.currentTravel.roundTrip = false;
    }
  }

  public checkFrequentDestination(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.travelService.currentTravel.frequentDestination != null) {
        this.navigationService
          .getCurrentBackgroundPosition()
          .then(location => {
            console.log('BackgroundGeolocation.getCurrentPosition:', location);
            let tolerancePercent = this.travelService.currentTravel.endTolerancePercent;
            let toleranceRadius = (tolerancePercent * this.travelService.currentTravel.km) / 100;

            let currentPosition = new google.maps.LatLng(
              +location.coords.latitude,
              +location.coords.longitude
            );
            let targetPosition = new google.maps.LatLng(
              +this.travelService.currentTravel.frequentDestination.destiny
                .latitude,
              +this.travelService.currentTravel.frequentDestination.destiny
                .longitude
            );

            var distance = google.maps.geometry.spherical.computeDistanceBetween(
              currentPosition,
              targetPosition
            );

            if (distance <= (toleranceRadius * 1000)) {
              this.frequentDestination = true;
            } else {
              this.frequentDestination = false;
            }

            resolve(this.frequentDestination);
          })
          .catch(err => {
            //TODO: Ver que hacer en este caso
            this.frequentDestination = true;
            resolve(true);
          });
      } else {
        this.frequentDestination = false;
        resolve(false);
      }
    });
  }

  public isFrequentDestination() {
    return this.frequentDestination;
  }

  creditCardErrorAlert(message: string) {
    let vm = this;

    let exitAction = function () {
      this.isClosed = true;
      vm.alertService.showingMessage = false;
      vm.travelService.timerReset();
    };

    let retryAction = function () {
      vm.alertService.showingMessage = false;
      vm.payTravelCreditCard();
    };

    let key = 'travel_resume.dialogs.'+message;
    let auxMessage= this.t('travel_resume.dialogs.'+message);
    message = (auxMessage != key) ? auxMessage : message;

    this.alertService.dialog(
      this.t('travel_resume.alert_title'),
      message,
      this.t('buttons.retry'),
      this.t('buttons.exit'),
      retryAction,
      exitAction
    );
  }

  errorAlert(message: string) {
    let vm = this;

    let exitAction = function () {
      this.isClosed = true;
      vm.alertService.showingMessage = false;
      vm.travelService.timerReset();
    };

    let retryAction = function () {
      vm.alertService.showingMessage = false;
      vm.payTravel();
    };

    let key = 'travel_resume.dialogs.'+message;
    let auxMessage= this.t('travel_resume.dialogs.'+message);
    message = (auxMessage != key) ? auxMessage : message;

    this.alertService.dialog(
      this.t('travel_resume.alert_title'),
      message,
      this.t('buttons.retry'),
      this.t('buttons.exit'),
      retryAction,
      exitAction
    );
  }

  noInternetConnectionAlert() {
    this.alertService.show(
      this.t('travel_resume.dialogs.no_connection_title'),
      this.t('travel_resume.dialogs.no_connection_text')
    );
  }

  private payTravel() {
    console.log("#Paytravel=> travel_resume.ts",this.travelService.currentTravel);
    this.travelService.saveCurrentTravel();
    console.log("#Paytravel=> travel_resume.ts","saveCurrentTravel");
    // Final trip values. Always call after saveCurrentTravel()
    const travelFinal = this.travelService.currentTravel;

    let payment:IPayTravelCommandParameters = <IPayTravelCommandParameters> {
      paymentMethod: ([PaymentMethodValueEnum.PRESET_CREDIT_CARD, PaymentMethodValueEnum.QR_CODE].includes(this.selectedPaymentMethodShow.value)) ? PaymentMethodValueEnum.CREDIT_CARD : this.selectedPaymentMethodShow.value,
      travelId: travelFinal.travelId,
      carrierUserId: +this.identityService.carrierUserId,
      finalKm: travelFinal.finalDistance,
      finalCost: travelFinal.totalCostFinal,
      transferCost: travelFinal.transferCost,
      totalTransferCost: travelFinal.totalTransferCost,
      totalCostPartial: travelFinal.totalCostPartial,
      wayPoints: JSON.stringify(travelFinal.sortedRouteWaypoints),
      destination: travelFinal.finalDestination,
      duration: travelFinal.travelDuration,
      waitDetailList: travelFinal.waitDetailList,
      dataSign: this.signBase64Provider.signPassengerBase64.value,
      containSign: this.signBase64Provider.containSign.value,
      tollPrice: travelFinal.priceToll == null ? 0 : travelFinal.priceToll,
      otherCost: travelFinal.priceOtherCost == null ? 0 : travelFinal.priceOtherCost,
      parking: travelFinal.priceParking == null ? 0 : travelFinal.priceParking,
      additionalStop: travelFinal.additionalStops == null ? 0 : travelFinal.additionalStops,
      waitTimePrice: travelFinal.priceWaitTime == null ? 0 : travelFinal.priceWaitTime,
      waitTime: travelFinal.waitMinutes == null ? 0 : travelFinal.waitMinutes,
      tollList: travelFinal.tollList ? travelFinal.tollList : null,
      parkingList: travelFinal.parkingList ? travelFinal.parkingList : null,
      otherCostList: travelFinal.otherCostList ? travelFinal.otherCostList : null,
      cardDetail: this.cardDetail,
      qrPayment: travelFinal.qrPayment,
      auditInfo: this.travelService.currentTravel.auditInfo,
      useDistanceMatrix: this.travelService.currentTravel.useDistanceMatrix
    };

    // Adjunto los datos del localstorage para auditorias tecnicas
    try {
      // Uso JSON.stringify y JSON.parse para evitar limpiar el routeWaypoint del objeto this.travelService.currentTravel.
      let technicalLog = JSON.stringify(this.travelService.currentTravel);
      let travelFinalLog: any = JSON.parse(technicalLog);
      travelFinalLog.routeWaypoints = [];
      travelFinalLog.sortedRouteWaypoints = [];
      travelFinalLog.origRouteWaypoints = [];
      payment.driverTechnicalLog = JSON.stringify(travelFinalLog);

      let additionalStops =
        this.travelService.currentTravel.additionalStops == null || this.travelService.currentTravel.rental
          ? 0
          : this.travelService.currentTravel.additionalStops;

      let waitMinutes =
        this.travelService.currentTravel.waitMinutes == null || this.travelService.currentTravel.rental
          ? 0
          : this.travelService.currentTravel.waitMinutes;

      let travelRateDetails: any = this.rateEngine.getBaseCosts(
        +this.travelService.currentTravel.finalDistance,
        +this.travelService.currentTravel.finalDistanceReturnTrip,
        +this.travelService.currentTravel.pricePerKM,
        +additionalStops,
        +waitMinutes,
        this.selectedPaymentMethodShow.value,
        this.travelService.currentTravel.km,
        this.travelService.currentTravel.lastWaypointsDistance,
        this.travelService.currentTravel.roundTrip,
        this.travelService.currentTravel.endTolerancePercent,
        this.travelService.currentTravel.rental,
        this.travelService.currentTravel.rentHours,
        this.travelService.currentTravel.rentType,
        this.travelService.currentTravel.travelDuration,
        this.travelService.currentTravel.taxiingDistance,
        this.travelService.currentTravel.lapDistance,
        this.travelService.currentTravel.taxiingAdjustmentCoeff,
        this.travelService.currentTravel.rateRules
      );

      payment.driverRateValues = JSON.stringify(travelRateDetails);
    } catch(err) {
      console.error(err);
    }

    // Guardo en local storage los datos de cierre por si ocurre un error
    this.travelService.currentTravel.paymentData = payment;
    this.travelService.saveCurrentTravel();

    this.finalizeTravel(this.travelService.currentTravel.paymentData);
  }

  private async finalizeTravel(payment: IPayTravelCommandParameters) {
    // Sign is required and is not setted
    if(this.mustToSign && !this.travelService.currentTravel.paymentData.dataSign) {
      this.loadingService.hide();

    const signerPage = await this.modalCtrl.create({
        component: SignerPage,
      });

      await signerPage.present();



      this.signBase64Provider.contain.pipe(takeUntil(this.destroy$)).subscribe((containSign) => {
        if(containSign) {
          payment.containSign = true;
          payment.dataSign = this.signBase64Provider.signPassengerBase64.value;
          this.pay(payment);
        }
      });
    }
    // Sign is not required
    else {
      this.refresh();
      this.pay(payment);
    }
  }

  async pay(payment: IPayTravelCommandParameters) {
    const travelFinal = this.travelService.currentTravel;
    this.loadingService.show();

    const realWaypointsVisited = await this.storageService.getData(StorageKeyEnum.realVisitedWaypoint).then(realWaypoints => {
      return realWaypoints ? JSON.parse(realWaypoints) : [];
    }).catch(error => {console.log('error getting real visited waypoints', error)});

    if (realWaypointsVisited.length > 0) {
      this.travelService.realVisitedWaypoint = new Array<RouteWaypointModel>();
      this.storageService.setData(StorageKeyEnum.realVisitedWaypoint, null);
    }

    console.log("#Paytravel=> travel_resume.ts","lanzaPago");
    this.travelService
      .pay(payment)
      .then(() => {
        //Logueo viaje al pagar en DRIVER_LOGS
        this.travelService.log({
          travelId: travelFinal.travelId,
          carrierUserId: payment.carrierUserId,
          driverId: 0,
          dataLog: JSON.stringify(travelFinal.origRouteWaypoints)
        })
        .then(() =>{
          console.log("viaje enviado");
        })
        .catch(error =>{
          console.log("error en reporte de viaje",error);
        });

        //Logueo de routewaypoints viaje al pagar en DRIVER_LOGS
        this.travelService.log({
          travelId: travelFinal.travelId,
          carrierUserId: payment.carrierUserId,
          driverId: 0,
          dataLog: '{Sorted_Route_Waypoints: ' + JSON.stringify(travelFinal.sortedRouteWaypoints) + ',Real_Visited_Waypoints: ' + JSON.stringify(realWaypointsVisited) + '}'
        })
        .then(() =>{
          console.log("Envio de routewaypoints");
        })
        .catch(error =>{
          console.log("error en reporte de viaje",error);
        });
        this.loadingService.hide();
        this.isClosed = true;
        this.refresh();
        this.router.navigate(['HomePage', { FROM_TRAVEL_CLOSED: true }]);
      })
      .catch(error => {
        // Expired token
        if(error.status === 400 && error.message === 'INVALID_CARD_TOKEN') {
          this.loadingService.hide();
          this.creditCardErrorAlert(error.message);
          this.refresh();
        }
        // MercadoPago Error
        else if(error.status === 400 && error.message === 'MERCADOPAGO_ERROR') {
          this.loadingService.hide();
          this.creditCardErrorAlert(error.message);
          this.refresh();
        }
        // Card problem
        else if(error.status === 402) {
          this.loadingService.hide();
          this.creditCardErrorAlert(error.message);
          this.refresh();
        }
        // Desynchronized waypoints.
        else if (error.status === 406) {
          this.loadingService.hide();
          this.alertService.toast('Error al procesar pago..');
          this.loadingService.show('Recalculando costos, aguarde..');
          this.travelService
            .getSynchronizeWaypoints(
              +this.identityService.carrierUserId,
              travelFinal.travelId
            )
            .then(response => {
              this.travelService.currentTravel.routeWaypoints = response.route;
              this.travelService.currentTravel.travelDuration = response.duration;
              this.travel.travelDuration = response.duration;
              this.travelService.saveCurrentTravel();
              this.loadingService.hide();
              this.recalculateRealDistance();
              this.refresh();
              this.alertService.toast('Costos recalculados, verifique..');
            })
            .catch(error => {
              this.loadingService.hide();
            });
        }
        else if (error.status === 0) {
          console.log("Viaje cerrado sin conexión. Agregando a lista de pendientes.");
          this.travelService.addUnsynchronizedTravel(payment);
          this.loadingService.hide();
          this.isClosed = true;
          this.refresh();
          this.router.navigate(['HomePage', { FROM_TRAVEL_CLOSED: true }]);
          this.travelService.showLostConectionMessage = true;
        }
        else {
          this.loadingService.hide();
          this.errorAlert(error.message);
          this.refresh();
        }
      });


  }


  toggleTravelDetails() {
    this.travelDetailsVisible = !this.travelDetailsVisible;
    this.refresh();

    setTimeout(() => {
      this.ionContent.scrollToBottom(1000);
    }, 100);
  }

  /**Recalculate the real distance and apply it to travelservice. After that, it also call calculateCost()*/
  recalculateRealDistance() {
    this.alertService.clear();
    this.loadingService.show(this.t('travel_resume.loading_location'));

    if(!this.travelService.currentTravel.finalDestination.latitude || !this.travelService.currentTravel.finalDestination.longitude) {
      console.log("Punto de cierre de viaje no asignado... asignando localización actual.");

      //if it can get the new location
      this.navigationService
        .getCurrentBackgroundPosition()
        .then((location) => {
          console.log('BackgroundGeolocation.getCurrentPosition:', location);
          this.travelService.setWaypoint(location.coords.latitude, location.coords.longitude, location.timestamp);
          this.getTravelDistance(location);
        })
        .catch(r => {
          let finalDestination:any;// Location;
          // if there are recorded waypoints, take the latest
          if(this.travelService.currentTravel.routeWaypoints.length > 0) {
            const waypoints = this.travelService.currentTravel.routeWaypoints;
            finalDestination = {
              timestamp: null,
              odometer: null,
              is_moving: null,
              uuid: null,
              coords: {
                latitude: +waypoints[waypoints.length - 1].location.lat,
                longitude: +waypoints[waypoints.length - 1].location.lng,
                accuracy: null
              },
              battery: null,
              activity: null
            }
          } else {
            // if there are not waypoints
            finalDestination = {
              timestamp: null,
              odometer: null,
              is_moving: null,
              uuid: null,
              coords: {
                latitude: +this.travelService.currentTravel.toLat,
                longitude: +this.travelService.currentTravel.toLong,
                accuracy: null
              },
              battery: null,
              activity: null
            }
          }

          this.getTravelDistance(finalDestination);
        });
    } else {
      console.log("Punto de cierre de viaje ya asignado.");
      console.log(this.travelService.currentTravel.finalDestination);
      const finalDestination: any = {
        timestamp: null,
        odometer: null,
        is_moving: null,
        uuid: null,
        coords: {
          latitude: +this.travelService.currentTravel.finalDestination.latitude,
          longitude: +this.travelService.currentTravel.finalDestination.longitude,
          accuracy: null
        },
        battery: null,
        activity: null
      }
      this.getTravelDistance(finalDestination);
    }

  }

  private resolveRealDistance(location: any, distance: number, roudTripDistance: number) {
    this.travelService.currentTravel.travelLength = distance / 1000;

    try {
      this.travelService.currentTravel.auditInfo.tripDelta =
        (this.travelService.currentTravel.travelLength * 100) /
        this.travelService.currentTravel.km;
    } catch(error) {
      console.log("Error al guardar datos de auditoria");
      console.error(error);
    }

    this.travelService.currentTravel.roundTripLength = this.travelService.currentTravel.roundTrip
                                                      ? roudTripDistance / 1000
                                                      : 0;

    let tolerance_percent = this.travelService.currentTravel
      .endTolerancePercent; //%
    let toleranceRadius =
      (tolerance_percent * this.travelService.currentTravel.km) /
      100; //Km
    let Xmin =
      this.travelService.currentTravel.km - toleranceRadius;
    let Xmax =
      this.travelService.currentTravel.km + toleranceRadius;

    if (
      this.travelService.currentTravel.travelLength >= Xmin &&
      this.travelService.currentTravel.travelLength <= Xmax
    ) {
      console.log("Distancia final dentro de % de tolerancia.");
      //use originally simulated distance
      this.setOriginalDestination(
        +location.coords.latitude,
        +location.coords.longitude
      );
    } else {
      console.log("Distancia fuera de % de tolerancia.");
      //use new real distance
      this.travelService.currentTravel.finalDestination.latitude = location.coords.latitude.toString();
      this.travelService.currentTravel.finalDestination.longitude = location.coords.longitude.toString();
      this.recalculateDestination(
        +location.coords.latitude,
        +location.coords.longitude
      );
    }
    this.refresh();
  };

  private getLinearDistance(waypoints: google.maps.LatLng[]): Promise<number> {
    return new Promise((resolve, reject) => {
      try {
        const lenght = google.maps.geometry.spherical.computeLength(waypoints);
        resolve(lenght);
      } catch(error) {
        resolve(0);
      }
    })
  }

  private reduceWaypoints(waypoints) {
    let splitLength = Math.ceil(waypoints.length / 23);
    let index = 0;
    let pointsHelper = [];
    while (index < waypoints.length) {
      pointsHelper.push(waypoints.slice(index, splitLength + index)[0]);
      index += splitLength;
    }
    return pointsHelper;
  }

  private async getTravelDistance(location: any): Promise<void> {
    const estimatedDistance = this.travelService.currentTravel.km * 1000;
    const isRoundTrip = this.travelService.currentTravel.roundTrip;
    const originLocation = new google.maps.LatLng(
      +this.travelService.currentTravel.fromLat,
      +this.travelService.currentTravel.fromLong
    );
    const destinationLocation = new google.maps.LatLng(
      +location.coords.latitude,
      +location.coords.longitude
    );
    const waypoints = this.travelService.getWaypointsAsLatLng();
    const lastSegmentWaypoints =  this.travelService.getLastSegmentWaypointsAsLatLng();

    let lastSegmentDistance = isRoundTrip? await this.getLinearDistance(lastSegmentWaypoints): 0;

    // The first number represents the required percentage. Ex. 1%.
    //const distanceCoefficient = 1 / 100;
    //const hasNecessaryWaypoints = waypoints.length >= ~~((estimatedDistance) * distanceCoefficient);

    //useDistanceMatrix se carga en el algoritmo de depuracion ROSA si es que depuro mas del 10% de los puntos.
    if ( !this.travelService.currentTravel.useDistanceMatrix) {
      console.info(`Puntos necesarios alcanzados, se procesa distancia con ${waypoints.length} puntos.`);
      const distance = await this.getLinearDistance(
        //originLocation,
        waypoints
      );
      this.resolveRealDistance(location, distance, lastSegmentDistance);
    } else {
      if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
          try {
            if (!google) throw 'Error al cargar la libreria de Google';

            console.info(`Puntos necesarios no alcanzados, se procesa distancia con ${waypoints.length} puntos (sin paradas intermedias ni ida y vuelta).`);
            console.info('Depuracion ROSA detecto uso distance matrix?',this.travel.useDistanceMatrix);
            let helperWaypoints: google.maps.LatLng[] = [];

            // se agregan los puntos reales visitados para calcular la distancia
            let realVisitedWaypoint: google.maps.LatLng[] = await this.travelService.getWaypointsRealVisitedAsLatLng();

            console.log('Puntos reales visitados: ', realVisitedWaypoint);

            console.log('Puntos intermedios presupuestados: ', waypoints);

            //TODO: Incluir posiciones geodesicas de paradas en caso que existan
            if(realVisitedWaypoint.length >= 23) {
              helperWaypoints = this.reduceWaypoints(realVisitedWaypoint);
            } else {
              if (realVisitedWaypoint.length > 0) {
                helperWaypoints = realVisitedWaypoint;
              } else {
                if (waypoints.length > 0) {
                  helperWaypoints = this.reduceWaypoints(waypoints);
                }
              }
            }

            const service = new google.maps.DirectionsService();
            service.route({
              origin: originLocation,
              waypoints: helperWaypoints.map(waypoint => {
                return {location: waypoint}
              }),
              destination: destinationLocation,
              travelMode: google.maps.TravelMode['DRIVING'],
              avoidTolls: this.travelService.currentTravel.avoidTolls,
              avoidHighways: this.travelService.currentTravel.avoidHighways,
              provideRouteAlternatives: true
            }, (response, status) => {
              if(response) {
                let distanceAndDuration;
                if(this.travelService.currentTravel.fastestRoute)
                  distanceAndDuration = this.getFastestRoute(response);
                else
                  distanceAndDuration = this.getShortestRoute(response);

                this.resolveRealDistance(location, distanceAndDuration.distance, lastSegmentDistance);
                this.refresh();
              } else {
                this.setOriginalDestination(
                  +location.coords.latitude,
                  +location.coords.longitude
                );
                this.refresh();
              }
            });
          } catch(error) {
            console.error(error);
            this.setOriginalDestination(
              +location.coords.latitude,
              +location.coords.longitude
            );
            this.refresh();
          }
      } else {
        console.info(`
          Puntos necesarios no alcanzados y conexión a internet nula. Se procesa distancia estimada.
        `);
        this.loadingService.hide();
        this.travelService.currentTravel.finalDestination.latitude = null;
        this.travelService.currentTravel.finalDestination.longitude = null;

        if(this.travelService.currentTravel.finalDestination.latitude && this.travelService.currentTravel.finalDestination.longitude){
          this.resolveRealDistance(location, estimatedDistance, lastSegmentDistance);
        } else {
          // Caso 7 de matriz donde solo tengo origen
          this.alertService.dialog(
            null,
            this.translateService.instant('travel_resume.dialogs.not_possible_to_close_trip'),
            this.t('buttons.ok'),
            null,
            () => {this.alertService.showingMessage = false},
            null
          );
        }

        this.refresh();
      }
    }
  }

  /** set the real destination short name for travelService and its finalDistance*/
  private recalculateDestination(latitude: number, longitude: number) {
    this.loadingService.show(this.t('travel_resume.dialogs.calculating_cost'));
    let thisClass = this;
    let recalculating = true;

    this.setLocationShortName(latitude, longitude);

    let realDistance = this.travelService.currentTravel.travelLength;
    this.travelService.currentTravel.finalDistance = realDistance;
    this.travelService.currentTravel.finalDistanceReturnTrip = thisClass.travelService.currentTravel.roundTripLength;
    this.travelService.currentTravel.lapDistance = thisClass.statusService.getNeareastBaseDistance(new google.maps.LatLng(+latitude, +longitude)) / 1000;

    this.calculateCost()
      .then(() => {
        recalculating = false;
        this.loadingService.hide();
      })
      .catch(() => {
        recalculating = false;
        this.loadingService.hide();
      });

    //default after 10 secs hide loading
    setTimeout(() => {
      if (recalculating) {
        thisClass.loadingService.hide();
        if (!thisClass.ref['destroyed']) {
          thisClass.ref.detectChanges();
        }
      }
    }, 15 * 1000);
  }

  setOriginalDestination(latitude?: number, longitude?: number) {
    this.loadingService.show(this.t('travel_resume.dialogs.calculating_cost'));

    if(latitude && longitude) this.setLocationShortName(latitude, longitude);
    else this.travelService.currentTravel.finalDestination.shortName = this.travelService.currentTravel.toName;
    this.travelService.currentTravel.finalDestination.latitude = latitude.toString();
    this.travelService.currentTravel.finalDestination.longitude = longitude.toString();
    this.travelService.currentTravel.finalDistance = this.travelService.currentTravel.km;
    this.travelService.currentTravel.travelLength = this.travelService.currentTravel.km;

    if(this.travelService.currentTravel.roundTrip) {
      this.travelService.currentTravel.roundTripLength = this.travelService.currentTravel.lastWaypointsDistance;
      this.travelService.currentTravel.finalDistanceReturnTrip = this.travelService.currentTravel.lastWaypointsDistance;
    } else {
      this.travelService.currentTravel.roundTripLength = 0;
      this.travelService.currentTravel.finalDistanceReturnTrip = 0;
    }

    this.calculateCost()
      .then(() => {
        this.loadingService.hide();
        this.refresh();
      })
      .catch(() => this.loadingService.hide());
  }

  getFastestRoute(routeResponse: google.maps.DirectionsResult) {
    let fastestRoute;
    routeResponse.routes.forEach(function(route, index) {
      let currentRoute = { distance: 0, duration: 0 };
      for(let i = 0; i < route.legs.length; i++) {
        currentRoute.distance+= route.legs[i].distance.value;
        currentRoute.duration+= route.legs[i].duration.value;
      }
      if(!fastestRoute || currentRoute.duration < fastestRoute.duration)
        fastestRoute = currentRoute;
    });
    return {
      distance: fastestRoute.distance,
      duration: fastestRoute.duration
    };
  }

  getShortestRoute(routeResponse: google.maps.DirectionsResult) {
    let shortestRoute;
    routeResponse.routes.forEach(function(route, index) {
      let currentRoute = { distance: 0, duration: 0 };
      for(let i = 0; i < route.legs.length; i++) {
        currentRoute.distance+= route.legs[i].distance.value;
        currentRoute.duration+= route.legs[i].duration.value;
      }
      if(!shortestRoute || currentRoute.distance < shortestRoute.distance)
        shortestRoute = currentRoute;
    });
    return {
      distance: shortestRoute.distance,
      duration: shortestRoute.duration
    };
  }

  setLocationShortName(latitude: number, longitude: number) {
    let thisClass = this;

    if(this.network.type != this.network.Connection.NONE && this.network.type != this.network.Connection.UNKNOWN) {
      let geocoder = new google.maps.Geocoder();
      let request = {
        latLng: new google.maps.LatLng(latitude.toString(), longitude.toString())
      };

      geocoder.geocode(request, (results, status) => {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0] != null) {
            thisClass.travelService.currentTravel.finalDestination.shortName =
              results[0].formatted_address;
              thisClass.travelService.currentTravel.finalDestination.placeId = results[0].place_id;
              if (!thisClass.ref['destroyed']) {
                thisClass.ref.detectChanges();
              }
          } else {
            thisClass.travelService.currentTravel.finalDestination.shortName = "N/D";
            thisClass.travelService.currentTravel.finalDestination.placeId = null;
            if (!thisClass.ref['destroyed']) {
              thisClass.ref.detectChanges();
            }
          }
        } else {
          thisClass.travelService.currentTravel.finalDestination.shortName = "N/D";
          thisClass.travelService.currentTravel.finalDestination.placeId = null;
          if (!thisClass.ref['destroyed']) {
            thisClass.ref.detectChanges();
          }
        }
      });
    } else {
      thisClass.travelService.currentTravel.finalDestination.shortName = "N/D";
      thisClass.travelService.currentTravel.finalDestination.placeId = null;
      if (!thisClass.ref['destroyed']) {
        thisClass.ref.detectChanges();
      }
    }
  }

  /**
   * Add a new toll.
   */
  public async addNewToll() {

      const tollModal = await this.modalCtrl.create({
        component: TravelAddTollModal,
        cssClass: 'popUp-Modal modalToll',
      });

      tollModal.onDidDismiss().then((data: any) => {
       if(data) {
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
      }
    });

      return await tollModal.present();


  }

  /**
   * Add a new parking.
   */
   async addNewParking() {
    const parkingModal = await this.modalCtrl.create({
      component: TravelAddParkingModal,
      cssClass: 'popUp-Modal modalParking',
    });

    parkingModal.onDidDismiss().then((data: any) => {
      if(data) {
        this.loadingService.show(this.t('travel_resume.dialogs.update_travel'));
        this.travelService.saveNewParking(data);
        this.calculateCost()
          .then(() => {
            setTimeout(() => {
              this.loadingService.hide();
              this.refresh();
            }, 1000);
          })
          .catch(() => this.loadingService.hide());
        this.refresh();
      }
    });

    return await parkingModal.present();
  }
  /**
   * Add other cost.
   */

  async addOtherCost() {
    const otherCostModal = await this.modalCtrl.create({
      component: TravelAddOtherCostModal,
      cssClass: 'popUp-Modal modalOther',
    });

    otherCostModal.onDidDismiss().then((data: any) => {
      if(data) {
          this.loadingService.show(this.t('travel_resume.dialogs.update_travel'));
        this.travelService.saveOtherCost(data);
        this.calculateCost()
          .then(() => {
            setTimeout(() => {
              this.loadingService.hide();
              this.refresh();
            }, 1000);
          })
          .catch(() => this.loadingService.hide());
        this.refresh();
      }
    });

    return await otherCostModal.present();
  }

  /**
   * Remove a toll.
   * @param item Toll object.
   * @param index Toll object position.
   */
  public removeTollItem(item: TollDetailItemModel, index: number) {
    let that = this;
    const valueTranslate = {
      "value": item.name
    }

    let cancelAction = () => {
      that.alertService.showingMessage = false;
    };

    let confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeTollItem(index);
      this.calculateCost()
        .then(() => {
          this.loadingService.hide();
          this.refresh();
        })
        .catch(() => this.loadingService.hide());
    };

    this.alertService.dialog(
      this.t('travel_resume.dialogs.delete_toll'),
      this.translateService.instant("travel_resume.dialogs.question_delete", valueTranslate),
      this.t('travel_resume.dialogs.accept'),
      this.t('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  /**
   * Remove a parking.
   * @param item Parking object.
   * @param index Parking object position.
   */
  public removeParkingItem(item: ParkingDetailItemModel, index: number) {
    let that = this;
    const valueTranslate = {
      "value": item.name
    }

    let cancelAction = () => {
      that.alertService.showingMessage = false;
    };

    let confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeParkingItem(index);
      this.calculateCost()
        .then(() => {
          this.loadingService.hide();
          this.refresh();
        })
        .catch(() => this.loadingService.hide());
    };

    this.alertService.dialog(
      this.t('travel_resume.dialogs.delete_parking'),
      this.translateService.instant("travel_resume.dialogs.question_delete", valueTranslate),
      this.t('travel_resume.dialogs.accept'),
      this.t('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  /**
   * Remove a cost.
   * @param item Parking object.
   * @param index Parking object position.
   */
  public removeOtherCostItem(item: OtherCostDetailItemModel, index: number) {
    let that = this;
    const valueTranslate = {
      "value": item.name
    }

    let cancelAction = () => {
      that.alertService.showingMessage = false;
    };

    let confirmAction = () => {
      that.alertService.showingMessage = false;
      that.travelService.removeOtherCostItem(index);
      this.calculateCost()
        .then(() => {
          this.loadingService.hide();
          this.refresh();
        })
        .catch(() => this.loadingService.hide());
    };

    this.alertService.dialog(
      this.t('travel_resume.dialogs.delete_other_cost'),
      this.translateService.instant("travel_resume.dialogs.question_delete", valueTranslate),
      this.t('travel_resume.dialogs.accept'),
      this.t('travel_resume.dialogs.cancel'),
      confirmAction,
      cancelAction
    );
  }

  public calculatePriceToll(): number {
    let priceToll: number = 0;
    let tollList: Array<TollDetailItemModel> = this.travelService.currentTravel.tollList;

    if(tollList) {
      if(tollList.length > 0) {
        tollList.forEach(tollItem => {
          priceToll += tollItem.price;
        });
      }
    }
    this.refresh();

    return priceToll;
  }

  public calculatePriceParking(): number {
    let priceParking: number = 0;
    let parkingList: Array<TollDetailItemModel> = this.travelService.currentTravel.parkingList;

    if(parkingList) {
      if(parkingList.length > 0) {
        parkingList.forEach(parkingItem => {
          priceParking += parkingItem.price;
        });
      }
    }
    this.refresh();

    return priceParking;
  }

  public calculatePriceOtherCost(): number {
    let priceOtherCost: number = 0;
    let otherCostList: Array<OtherCostDetailItemModel> = this.travelService.currentTravel.otherCostList;

    if(otherCostList && otherCostList.length > 0) {
      otherCostList.forEach(otherCostItem => {
        priceOtherCost += otherCostItem.price;
      });
    }
    this.refresh();

    return priceOtherCost;
  }

  /**
   * Calcula el precio total de las esperas.
   */
  public calculatePriceWaitTime(): void {
    let totalWaitTime: number = 0;
    const waitTime = this.travelService.currentTravel.waitMinutes;
    const pricePerKM = this.travelService.currentTravel.pricePerKM
    const rules = this.travelService.currentTravel.rateRules;

    if(waitTime > 0) {
      totalWaitTime = this.rateEngine.calculateWaitTimeCost(waitTime, pricePerKM, rules);
    }

    this.travelService.setPriceWaitTime(totalWaitTime);
    this.refresh();
  }

  private checkHighlightAddresses() {
    this.storageService.getData(StorageKeyEnum.highlightAddresses)
      .then(highlight => {
        this.highlightAddresses = !!highlight;
      });
  }

  /*private checkCanGoBack() {
    console.log("NAV CTRL", this.navCtrl.getPrevious().id);
    if(this.navCtrl.getPrevious().id === 'TravelTransferCostPage')
      this.canGoBack = true;
  }*/

  private checkCanGoBack() {
    this.router.events.pipe(filter((evt:any)=>evt instanceof RoutesRecognized),pairwise())
    .subscribe((events:RoutesRecognized[])=>{
    if(events[0].urlAfterRedirects){
      this.canGoBack = true;
    }
    })


  }

  goBack() {
    this.navCtrl.pop();
  }

  private refreshCurrentTravel() {
    this.travel = this.travelService.currentTravel;
  }
}

export class PaymentMethodShow {
  value: PaymentMethodValueEnum;
  label: PaymentMethodLabelEnum | String;

  constructor(value?: PaymentMethodValueEnum, label?: PaymentMethodLabelEnum) {
    this.value = value;
    this.label = label;
  }
}
