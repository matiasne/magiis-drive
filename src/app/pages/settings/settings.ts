import { Component } from '@angular/core';
import { StorageService } from '../../services/storage/storage.service';
import { StorageKeyEnum } from '../../services/storage/storageKeyEnum.enum';
import { TranslateService } from '@ngx-translate/core';
import { IdentityService } from '../../services/identity.service';
import { NavigationService } from '../../services/navigation.service';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { NavController, Platform } from '@ionic/angular';


@Component({
  selector: 'app-page-settings',
  templateUrl: 'settings.html',
  styleUrls: ['settings.scss']
})
export class SettingsPage {
  autoShowMapOnTravel: boolean;
  outOfService: boolean;
  showCarrierCircle: boolean;
  preferredMapService = '';
  highlightAddresses: boolean;
  currentLanguage = '';
  flagURL = '';

  public mapServicesCollection: any[];
  public languagesCollection: string[];

  constructor(
    private identityService: IdentityService,
    private navigationService: NavigationService,
    private launchNavigator: LaunchNavigator,
    public navCtrl: NavController,
    private storageService: StorageService,
    private platform: Platform,
    private translateService: TranslateService
  ) {
    this.mapServicesCollection = new Array<any>();
    this.languagesCollection = new Array<string>();
  }

  ionViewDidEnter() {
    if (!this.platform.is('desktop') && !this.platform.is('mobileweb')){
      this.initializeMapServices();
    }
    this.initializeLanguage();
  }
  
  t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }
  
  ionViewWillEnter() {
    this.outOfService = this.identityService.outOfService;

    //load from localstorage
    this.autoShowMapOnTravel = this.storageService.getData(StorageKeyEnum.autoShowMapOnTravel);

    this.preferredMapService = this.storageService.getData(StorageKeyEnum.preferredNavigationApp);

    this.showCarrierCircle = this.storageService.getData(StorageKeyEnum.showCarrierCircle);

    this.highlightAddresses = this.storageService.getData(StorageKeyEnum.highlightAddresses);

    
    this.platform.backButton.subscribe(() => {
      this.navCtrl.pop();
    });
  }

  toggleOutOfService() {
    return this.identityService.setOutOfService(this.outOfService);
  }

  toggleAutoShowMapOnTravel() {
    
    //save to localstorage
    this.storageService.setData(
      StorageKeyEnum.autoShowMapOnTravel,
      this.autoShowMapOnTravel
    );
  }

  toggleHighlightAddresses() {
    //save to localstorage
    this.storageService.setData(
      StorageKeyEnum.highlightAddresses,
      this.highlightAddresses
    );
  }

  onPreferredMapServiceChanged(service: string) {
    this.identityService.setPreferredNavigationApp(service);
  }

  toggleShowCarrierCircle() {
    
    //save to localstorage
    this.storageService.setData(
      StorageKeyEnum.showCarrierCircle,
      this.showCarrierCircle
    );
    this.identityService.notifyUpdatePreferences();
  }

  initializeMapServices(): void {
    this.navigationService.getAvailableApps().then((services) => {
      services.forEach((service) => {
        this.mapServicesCollection.push({
          name: this.launchNavigator.getAppDisplayName(service),
          value: service,
        });
      });
    });
  }

  initializeLanguage(): void {
    
    this.languagesCollection = Object.assign(
      this.languagesCollection,
      this.translateService.getLangs()
      );

    if (this.translateService.currentLang === undefined) {
      this.currentLanguage = this.translateService.defaultLang;
    } else {
      this.currentLanguage = this.translateService.currentLang;
    }
  }

  onLanguageChanged(language: string): void {
    this.translateService.use(language);
    this.currentLanguage = language;
    this.storageService.setData(StorageKeyEnum.defaultLanguage, language);
  }

  //RESERV IT
  public setFlag(language: string) {
    if(language == 'en') {
     this.flagURL = 'assets/images/enFlag.png';
    } else {
     this.flagURL = 'assets/images/Spain (ES).png';
    }
 
   }

   submit() {
    this.goBack()
   }

  goBack() {
    this.navCtrl.back();
  }
}
