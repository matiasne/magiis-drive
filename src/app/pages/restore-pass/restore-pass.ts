import { Component } from '@angular/core';
import { AlertsService } from '../../services/common/alerts.service';
import { AuthenticationService } from '../../services/authentication.service';
import { LoadingService } from '../../services/loading-service';
import { TranslateService } from '@ngx-translate/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
//import  '../../theme/variables.scss';


@Component({
    selector: 'app-page-restore-pass',
    templateUrl: 'restore-pass.html',
    styleUrls:['restore-pass.scss']
})
export class RestorePassPage {

    restorePassForm: FormGroup;

    constructor(public navCtrl: NavController,
        private alertService: AlertsService,
        private authentication: AuthenticationService,
        private loadingService: LoadingService,
        private translateService: TranslateService,
        private router: Router
    ) {
        this.restorePassForm = new FormGroup({
            email: new FormControl('', [Validators.required, Validators.email])
        });
    }
    public submit() {
      this.restorePass();
  }
    restorePass() {
        this.loadingService.show();
        this.authentication.restorePass(this.restorePassForm.controls.email.value)
        .then(data => {
            this.alertService.show(this.t('restore_pass.sent_title'), this.t('restore_pass.sent_message'));
            ////this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
            this.loadingService.hide();
        })
        .catch(error => {
            this.loadingService.hide();

            if (error.status === 401) {
                this.alertService.show(this.t('restore_pass.error_401_title'),this.t('restore_pass.error_401'));
            }
            else if (error.status === 403) {
                this.alertService.show(this.t('restore_pass.error_403_title'),this.t('restore_pass.error_403'));
            }
            else if (error.status === 404) {
                this.alertService.show(this.t('restore_pass.sent_title'),this.t('restore_pass.sent_message'));
                ////this.navCtrl.popToRoot();
this.router.navigate(['HomePage']);
            }
            else if (error.status === 0) {
                this.alertService.show(this.t('restore_pass.error_0_title'),this.t('restore_pass.error_0'));
            }
            else {
                this.alertService.show(this.t('restore_pass.error_unknown_title'),this.t('restore_pass.error_unknown'));
            }
        });
    }

    ionViewDidEnter() {
    }

    goBack() {
      this.navCtrl.back();
    }

    private t(translationKey: string) {
        return this.translateService.instant(translationKey);
    }
}
