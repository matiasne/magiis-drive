import { Component } from '@angular/core';
import { MenuController, NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { PermissionService } from '../../services/permissions/permission.service';
import { takeUntil } from 'rxjs/operators';
import { Device } from '@awesome-cordova-plugins/device/ngx';

@Component({
	selector: 'app-page-required-permission',
	templateUrl: 'required-permission.html',
  styleUrls: ['required-permission.scss']
})

export class RequiredPermissionPage {
  destroy$: Subject<boolean> = new Subject<boolean>();
  locationInstructions: string;
  motionInstructions: string;
  locationPermissionAllowed: boolean;
  motionPermissionAllowed: boolean;
  locationPermissionDenied: boolean;
  motionPermissionDenied: boolean;

	constructor(
    private device: Device,
    private menuController: MenuController,
    private permissionService: PermissionService,
    private navCtrl: NavController,
    private platform: Platform,
    private translateService: TranslateService,

  ) {
    this.locationInstructions = this.translateService.instant('permission.location.instructions_message');
    this.motionInstructions = this.translateService.instant('permission.motion.instructions_message');

    this.locationPermissionAllowed = false;
    this.motionPermissionAllowed = false;
    this.locationPermissionDenied = false;
    this.motionPermissionDenied = false;

    this.menuController.enable(false);
  }

	ionViewDidEnter() {
    this.verifyPermissions();

    this.platform.resume.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.verifyPermissions();
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  verifyPermissions() {
    if(this.platform.is('android')) {
      return this.verifyPermissionsAndroid();
    }
    else {
      return this.verifyPermissionsIOS();
    }
  }

  verifyPermissionsAndroid() {
    return this.permissionService.verifyLocationPermission()
      .then((locationAllowed: boolean) => {
        if(locationAllowed) {
          if(Number(this.device.version) >= 10) {
            this.locationPermissionAllowed = true;
            this.permissionService.verifyMotionPermission()
              .then((motionAllowed: boolean) => {
                if(motionAllowed) {
                  this.navCtrl.navigateRoot('HomePage');
                }
              });
          } else {
            this.navCtrl.navigateRoot('HomePage');
          }
        }
      });
  }

  verifyPermissionsIOS() {
    return this.permissionService.verifyLocationPermission()
      .then((locationAllowed: boolean) => {
        if(locationAllowed) {
          this.navCtrl.navigateRoot('HomePage');
        }
      });
  }

  goToLocationSettings() {
    if(this.platform.is('android')) {
      this.goToLocationSettingsAndroid();
    }
    else {
      this.goToLocationSettingsIOS();
    }
  }

  goToLocationSettingsAndroid() {
    if(!this.locationPermissionDenied) {
      this.permissionService.goToLocationSettings()
        .then(allowed => {
          if(allowed) {
            this.verifyPermissions();
          } else {
            this.locationPermissionDenied = true;
            if(Number(this.device.version) >= 10) {
              this.locationInstructions = this.translateService.instant('permission.location.instructions_message_config');
            } else {
              this.locationInstructions = this.translateService.instant('permission.location.instructions_message_config_alt');
            }
          }
        });
    } else {
      this.permissionService.goToSettings();
    }
  }

  goToLocationSettingsIOS() {
    if(!this.locationPermissionDenied) {
      this.permissionService.goToLocationSettings()
        .then(allowed => {
          if(allowed) {
            this.verifyPermissions();
          } else {
            this.locationPermissionDenied = true;
            this.locationInstructions = this.translateService.instant('permission.location.instructions_message_config_alt');
          }
        });
    } else {
      this.permissionService.goToSettings();
    }
  }

  // Solo Android
  goToMotionSettings() {
    this.permissionService.goToMotionSettings()
      .then(allowed => {
        if(!this.motionPermissionDenied) {
          if(this.platform.is('android')) {
            if(!allowed) {
              this.motionPermissionDenied = true;
              if(Number(this.device.version) >= 10) {
                this.motionInstructions = this.translateService.instant('permission.motion.instructions_message_config');
              } else {
                this.motionInstructions = this.translateService.instant('permission.motion.instructions_message_config_alt');
              }
            }
          } else {
            this.verifyPermissions();
          }
        } else {
          this.permissionService.goToSettings();
        }
      });
  }
}
