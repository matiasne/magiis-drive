import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
//import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
//import { Keyboard } from '@ionic-native/keyboard/ngx';
import { NavController, AlertController, MenuController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ImageAttachModalPage } from 'src/app/components/image-attach-modal/image-attach-modal';
import { GlobalProvider } from 'src/app/providers/global/global';
import { AppSettings } from 'src/app/services/app-settings';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { AlertsService } from 'src/app/services/common/alerts.service';
import { IdentityService } from 'src/app/services/identity.service';
import { LoadingService } from 'src/app/services/loading-service';
import { StorageService } from 'src/app/services/storage/storage.service';
import { StorageKeyEnum } from 'src/app/services/storage/storageKeyEnum.enum';
import { TravelAddOtherCostModal } from '../travel-add-other/travel-add-other';
import { TravelAddParkingModal } from '../travel-add-parking/travel-add-parking';
import { TravelAddTollModal } from '../travel-add-toll/travel-add-toll';
import { TravelCancelModal } from '../travel-cancel/travel-cancel';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
})
export class LoginPage implements OnInit {

  userName: string = 'uatchoferfuturo4@gmail.com';
  password: string = '123';
  rememberPassword: boolean = false;

  mapper = {
    'TravelAddOtherCostModal': TravelAddOtherCostModal,
    'TravelAddParkingModal': TravelAddParkingModal,
    'TravelAddTollModal': TravelAddTollModal,
    'ImageAttachModalPage': ImageAttachModalPage,
    'TravelCancelModal': TravelCancelModal
  };
  addOther: TravelAddOtherCostModal;

    constructor(private navCtrl: NavController,
        private authentication: AuthenticationService,
        private alertService: AlertsService,
        private alertCtrl: AlertController,
        private loadingService: LoadingService,
      //  private keyboard: Keyboard,
        public menu: MenuController,
        private identityService: IdentityService,
        private storageService: StorageService,
        private translateService: TranslateService,
        public global: GlobalProvider,
        public router:Router,
        private modalCtrl: ModalController
    ) { }

  ngOnInit(): void {
  }

  async launch(component: string) {
    const modal = await this.modalCtrl.create({
      component: this.mapper[component],
      cssClass: 'transparent-modal'
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      // this.message = `Hello, ${data}!`;
    }
  }


  ionViewWillEnter() {
    this.menu.enable(false);
    this.identityService.getLoginUserEmail()
      .then(userEmail => this.userName = userEmail);
    this.identityService.getLoginUserPassword()
      .then(userPassword => this.password = userPassword);
  }

    keyboardCheck() {
        return false;//this.keyboard.isVisible;
    }

    private t(translationKey: string) {
        return this.translateService.instant(translationKey);
    }

  public submit() {

    let title = this.t('login.messages.error_title');
    if (this.userName.trim() === "" || this.userName === undefined || this.userName === 'undefined') {

      this.alertService.show(title, this.t('login.messages.user_error'));
      return;
    }
    if (this.password.trim() === "" || this.password === undefined || this.userName === "undefined") {
      this.alertService.show(title, this.t("login.messages.password_error"))
      return
    }

    if (AppSettings.ENVIROMENT_SELECTION_ENABLED && AppSettings.SUPER_ADMIN_EMAIL === this.userName) {
      this.presentPrompt();
    } else {
      this.login();
    }
  }

  private async presentPrompt() {
    let alert = await this.alertCtrl.create({
      header: this.t('login.messages.environment.prompt_title'),
      inputs:[
        {
            type: 'radio',
            label: 'PROD',
            value: 'https://api.apps.magiis.com/'
        },
        {
            type: 'radio',
            label: 'DEMO',
            value: 'https://magiisdev.azulado.com.ar/magiis-v0.2/'
        },
        {
            type: 'radio',
            label: 'TEST',
            value: 'https://apps-test.magiis.com/magiis-v0.2/'
        }
    ],
      buttons: [
        {
          text: this.t('login.messages.environment.cancel_text'),
          role: this.t('login.messages.environment.cancel_role'),
          handler: data => {
          }
        },
        {
          text: this.t('login.messages.environment.accept_text'),
          handler: data => {
            //URL.value = data;
            this.storageService.setData(StorageKeyEnum.customHost, data);
          }
        }
      ]
    });
    alert.present();
  }


  private login() {
    this.loadingService.show();
    this.identityService.setLoginUserEmail(this.userName);
    if(this.rememberPassword) this.identityService.setLoginUserPassword(this.password);
    this.authentication.login(this.userName, this.password, "ROLE_DRIVER")
      .then(data => {
        console.log(data)
        this.router.navigate(["/navigator/home",{FROM_LOGIN:true}]);
        this.loadingService.hide();
      })
      .catch(error => {
        this.loadingService.hide();
        this.alertService.show(this.t("login.messages.warning_title"), error.message);
      });
  }

  restorePassword() {
    this.router.navigate(["RestorePassPage"]);
  }

  showHost(){
    this.identityService.showHost();
  }


}
