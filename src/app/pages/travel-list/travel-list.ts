import { IdentityService } from './../../services/identity.service';
import { TranslateService } from '@ngx-translate/core';
import { CallService } from './../../services/call.service';
import { AlertsService } from './../../services/common/alerts.service';
import { Component } from '@angular/core';
import { TravelListModel } from '../../models/travel-list.model';
import { TravelServerStatusEnum } from '../../services/enum/travel-server-status.enum';
import { TravelService } from '../../services/travel.service';
import { LoadingService } from '../../services/loading-service';
import { ScrollListModel } from '../../models/scroll-list.model';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { IParametersData } from '../../models/carrier-parameters.model';
import { LocalizationService } from '../../services/localization/localization.service';
import { NavController, Platform } from '@ionic/angular';
import { Router } from '@angular/router';


@Component({
    selector: 'app-page-travel-list',
    templateUrl: 'travel-list.html',
    styleUrls:['travel-list.scss']
  })
export class TravelListPage {

    travelMadeList: ScrollListModel = new ScrollListModel();
    travelScheduledList: ScrollListModel = new ScrollListModel();

    public travelFilter: TravelFilterEnum = TravelFilterEnum.SCHEDULED;
    carrierParameters: IParametersData;

    pepe = false;

    constructor(
        public navCtrl: NavController,
        public travelService: TravelService,
        private loadingService: LoadingService,
        private platform: Platform,
        public translateService: TranslateService,
        private alertService: AlertsService,
        private callService: CallService,
        private identityService: IdentityService,
        public localizationService: LocalizationService,
        private router: Router
    ) {

    }

    ionViewDidEnter() {
        // if(this.navParams.get("data") === "FROM_NOTIFICATION") {
        //     this.travelFilter = TravelFilterEnum.SCHEDULED;
        // }
        this.getCarrierParameters();
        this.getTravelsScheduled();//fill first column with data
    }

    ionViewWillEnter() {
        this.platform.backButton.subscribe(() => {
            this.navCtrl.pop();
        });
    }

    getCurrencySymbol() {
      return this.localizationService.localeData
        ? this.localizationService.localeData.currency.symbol
        : '$';
    }

    formatDateDay(date) {
      return new Date(date).toLocaleDateString();
    }

    formatDateTime(date) {
      return new Date(date).toLocaleTimeString();
    }

    getCurrentLang(): string {
      return this.translateService.currentLang
        ? this.translateService.currentLang
        : this.translateService.defaultLang;
    }

    getTravelsMade(): Promise<any> {
        if(this.travelMadeList.isFirstPage){this.loadingService.show();}
        return this.travelService.getTravelList(false, this.travelMadeList.pageNumber, this.travelMadeList.pageSize).then(response => {
            if(!response.page.lastPage)
            {
                for (const content of response.page.content) {
                    const travel = new TravelListModel();
                    travel.creationDate = new Date(content.creationDate);
                    travel.origin = content.origin;
                    travel.destination = content.destination;
                    travel.state = this.travelService.getTravelStatuslabel(content.state);
                    travel.finalPrice = content.state == TravelServerStatusEnum.DONE? content.finalPrice : '0';
                    travel.travelId = content.travelId;
                    travel.travelIdForCarrier = content.travelIdForCarrier;
                    travel.paymentMethod = content.paymentMethod;
                    travel.originPlatform = content.originPlatform;
                    travel.waypoints = content.waypoints;
                    travel.avoidTolls = content.avoidTolls;
                    travel.avoidHighways = content.avoidHighways;
                    travel.ETAFromBase = content.etafromBase;
                    travel.hideAmountsDriver = content.hideAmountsDriver;
                    travel.affiAgreementId = content.affiAgreementId;
                    travel.distanceToPPUP = content.distanceToPPUP;
                    this.travelMadeList.items.push(travel);
                }

                this.travelMadeList.pageNumber++;
                this.travelMadeList.totalPages = response.page.totalPages;
                this.travelMadeList.isLastPage = response.page.lastPage;
            }
            if(this.travelMadeList.isFirstPage){this.loadingService.hide();}
            this.travelMadeList.isFirstPage = false;
        })
        .catch(() => {
            if(this.travelMadeList.isFirstPage){this.loadingService.hide();}
        });
    }

    doInfiniteTravelsMade(event): Promise<any> {
        if(this.travelMadeList.isLastPage){event.complete();}
        return this.getTravelsMade();
    }

    getTravelsScheduled(): Promise<any> {
        if(this.travelScheduledList.isFirstPage){this.loadingService.show();}
        return this.travelService.getTravelList(true, this.travelScheduledList.pageNumber, this.travelScheduledList.pageSize)
        .then(response => {
            if(!response.page.lastPage)
            {
                for (const content of response.page.content) {
                    const travel = new TravelListModel();
                    travel.creationDate = new Date(content.creationDate);
                    travel.origin = content.origin;
                    travel.destination = content.destination;
                    travel.state = this.travelService.getTravelScheduledStatuslabel(content.state);
                    travel.finalPrice = content.state == TravelServerStatusEnum.DONE? content.finalPrice : content.simulatePrice;
                    travel.travelId = content.travelId;
                    travel.travelIdForCarrier = content.travelIdForCarrier;
                    travel.paymentMethod = content.paymentMethod;
                    travel.serverState = content.state;
                    travel.originPlatform = content.originPlatform;
                    travel.ETAFromBase = content.etafromBase;
                    travel.hideAmountsDriver = content.hideAmountsDriver;
                    travel.affiAgreementId = content.affiAgreementId;
                    this.travelScheduledList.items.push(travel);
                    //console.log("travel", travel);
                }

                this.travelScheduledList.pageNumber++;
                this.travelScheduledList.totalPages = response.page.totalPages;
                this.travelScheduledList.isLastPage = response.page.lastPage;
            }
            if(this.travelScheduledList.isFirstPage){this.loadingService.hide();}
            this.travelScheduledList.isFirstPage = false;
        })
        .catch(() => {
            if(this.travelScheduledList.isFirstPage){this.loadingService.hide();}
        });
    }

    parsePaymentMethod(paymentType: string) {
      switch (paymentType.toLowerCase()) {
        case 'cash':
          return 'payment_method.cash';
        case 'checking account':
          return 'payment_method.checking_account';
        case 'credit card':
          return 'payment_method.credit_card';
        case 'qr':
          return 'payment_method.qr';
        default:
          return '???';
      }
    }

    doInfiniteTravelsScheduled(event): Promise<any> {
        if(this.travelScheduledList.isLastPage){event.complete();}
        return this.getTravelsScheduled();
    }

    showTravel(travel: any) {
      travel.showTravel = !travel.showTravel;
      console.log(travel.showTravel);
        // this.router.navigate(['TravelDetailPage'], {state: {travel}});
    }

    showCancelDialog(travelId: number) {

        const cancelAction = () => {
            this.alertService.showingMessage = false;
        };

        const confirmAction = () => {
            this.alertService.showingMessage = false;
            this.loadingService.show();
            this.travelService.cancelScheduledTravel(travelId, +this.identityService.carrierUserId, '').then(() => {
                //Refresh list
                this.travelScheduledList = new ScrollListModel();
                this.travelMadeList = new ScrollListModel();
                this.getTravelsScheduled().then(() => {
                    this.loadingService.hide();
                }).catch(error => {
                    console.error('Error in getTravelsScheduled of Travel List => ', error);
                    this.loadingService.hide();
                });
            }).catch((error) => {
                console.error('Error in cancelScheduledTravel of Travel List', error);
                this.loadingService.hide();
                //option to call carrier
                const call_cancelAction = () => {
                    this.alertService.showingMessage = false;
                };
                const call_confirmAction = () => {
                    this.alertService.showingMessage = false;
                    this.callService.call('CALL_CARRIER');
                    //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
                };
                this.alertService.dialog(this.translateService.instant('travel_list.out_conexion.title'), this.translateService.instant('travel_list.out_conexion.message'), this.translateService.instant('travel_list.out_conexion.call'), this.translateService.instant('travel_list.out_conexion.cancel'), call_confirmAction, call_cancelAction);
            });
        };
      this.alertService.dialog(this.translateService.instant('travel_list.cancel_trip_button.title'), this.translateService.instant('travel_list.cancel_trip_button.message'), this.translateService.instant('travel_list.cancel_trip_button.button_accept'), this.translateService.instant('travel_list.cancel_trip_button.button_cancel'), confirmAction, cancelAction);
    }

    public confirm(travel: any) {
        this.travelService.timerReset();

        this.loadingService.show();

        this.travelService.goingToClient(travel.travelId, +this.identityService.carrierUserId, +this.identityService.userId).then((response: CurrentTravelModel) => {
            this.travelService.currentTravel = new CurrentTravelModel();
            this.travelService.currentTravel = response;
            this.travelService.currentTravel.endTolerancePercent = response.endTolerancePercent;
            this.travelService.saveCurrentTravel();
            this.router.navigate(['TravelToStartPage']);
            this.loadingService.hide();
        }).catch(err => {
            this.loadingService.hide();
            this.alertService.show('Aviso', err.message);
            if (err.status !== 0){
                //this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
            }
        });
    }
    canConfirm(travel){
        return ((travel.creationDate.getTime() - new Date().getTime()) / 60000) <= (this.carrierParameters.dispatchNotify + travel.ETAFromBase);
    }

    getCarrierParameters(){
        return this.travelService.getParameters().then(parameters => {
            this.carrierParameters = parameters;
        });
    }

    goBack() {
      this.navCtrl.back();
    }
}

export enum TravelFilterEnum{
    MADE = 'MADE',
    SCHEDULED = 'SCHEDULED',
}
