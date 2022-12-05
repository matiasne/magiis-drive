import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from './services/authentication.service';
import { IdentityService } from './services/identity.service';

declare var google;

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  outOfService: boolean;
  public appPages = [
    { title: 'Preferencias', url: '/Settings' },
    { title: 'Mis viajes', url: '/TravelListPage' },
    { title: 'Estadísticas', url: '/Stats' },
  ];
  constructor(
    private translateService: TranslateService,
    private identityService: IdentityService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private menuController: MenuController,
  ) {
    this.translateService.addLangs(['es', 'en']);
    const def = 'es';
    this.translateService.setDefaultLang(def);
  }
  ionViewWillEnter() {
    this.outOfService = this.identityService.outOfService;
    console.log(this.outOfService);
    
  }

  logOut() {
    this.authenticationService.logout();
    this.menuController.close();
    this.router.navigate(['login']);
  }

  toggleOutOfService() {
    console.log('outof', this.identityService.setOutOfService(this.outOfService));
    
    return this.identityService.setOutOfService(this.outOfService);
  }

}
