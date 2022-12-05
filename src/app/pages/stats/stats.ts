import { LoadingService } from './../../services/loading-service';
import { TravelService } from './../../services/travel.service';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { StatsResponse } from '../../services/connection/stats.response';
import { LocalizationService } from '../../services/localization/localization.service';
import { NavController, Platform } from '@ionic/angular';

@Component({
    selector: 'app-page-stats',
    templateUrl: 'stats.html',
    styleUrls: ['stats.scss']
})
export class StatsPage {
    details = false;
    stats: StatsResponse = new StatsResponse();
    rateDescription: Array<string> = new Array<string>(
        'stats.rateLabel_1',
        'stats.rateLabel_2',
        'stats.rateLabel_3',
        'stats.rateLabel_4'
    );
    filterTodayActive = false;
    filterMonthlyActive = false;
    statMonthlyDaily = 'daily';

    constructor(
        public navCtrl: NavController,
        public translateService: TranslateService,
        private platform: Platform,
        private travelService: TravelService,
        private loadingService: LoadingService,
        private localizationService: LocalizationService
    ) {

        console.log('stats', this.stats);

    }

    ionViewDidEnter() {
        console.log('ionViewDidLoad StatsPage');
        this.filter_today();
    }

    ionViewWillEnter() {
        this.platform.backButton.subscribe(() => {
            this.navCtrl.pop();
        });
    }

    filter_today() {
        this.loadingService.show();
        this.filterTodayActive = true;
        this.filterMonthlyActive = false;
        this.travelService.getStats(this.getTodayInitialDate(), new Date()).then((stats: StatsResponse)  => {
            this.stats = stats;
        if(this.stats.ratings.length != 0) {
            this.details = true;
        }



            this.loadingService.hide();
        }).catch(() =>{
            this.loadingService.hide();
        });
    }

    filter_monthly() {
        this.loadingService.show();
        this.filterTodayActive = false;
        this.filterMonthlyActive = true;
        this.travelService.getStats(this.getFirstDateOfMonth(), new Date()).then((stats: StatsResponse)  => {
            this.stats = stats;
            console.log('stats', this.stats);

            this.loadingService.hide();
        }).catch(() =>{
            this.loadingService.hide();
        });
    }

    getCurrencySymbol() {
      return this.localizationService.localeData
        ? this.localizationService.localeData.currency.symbol
        : '$';
    }

    getTodayInitialDate() {
        const today = new Date();
        const todayInitialDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0, 0);
        return todayInitialDate;
    }

    getFirstDateOfMonth() {
        const today = new Date();
        const firstDateOfMonth = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0);
        return firstDateOfMonth;
    }

    goBack() {
      this.navCtrl.back();
    }
}
