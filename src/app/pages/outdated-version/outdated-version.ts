import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { Platform, MenuController, NavController, NavParams } from '@ionic/angular';
import { Subject } from 'rxjs';

@Component({
	selector: 'app-page-outdated-version',
	templateUrl: 'outdated-version.html',
  styleUrls: ['outdated-version.scss']
})

export class OutdatedVersionPage {
  destroy$: Subject<boolean> = new Subject<boolean>();

  required: boolean;
  packageName: string;

	constructor(
    private platform: Platform,
    private menuController: MenuController,
    private navCtrl: NavController,
    private router: Router,
    private appVersion: AppVersion,
  //  private market: Market
  ) {
    this.menuController.enable(false);
    this.required = this.router.getCurrentNavigation().extras.state.required
    
    this.appVersion.getPackageName().then(appPackage => {
      this.packageName = appPackage;
      console.log(this.packageName);
    });
  }

	ionViewDidEnter() {}

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  goToMarket() {
  /*  if(this.platform.is("android")) {
      this.market.open(this.packageName.toString());
    } else {
      this.market.open('id1429720020');
    }*/
  }

  updateLater() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        FROM_UPDATE_WARNING: true
      }
    };
    this.navCtrl.navigateRoot('HomePage',navigationExtras);
  }
}
