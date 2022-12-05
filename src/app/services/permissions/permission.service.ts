import { Injectable } from "@angular/core";
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Platform } from "@ionic/angular";

@Injectable({providedIn:'root'})
export class PermissionService {
  constructor(
    private diagnostic: Diagnostic,
    private platform: Platform,
    private device:Device,
    private androidPermissions: AndroidPermissions
  ) {}

  public verifyPermissions() {
    if(this.platform.is('android')) return this.verifyPermissionsAndroid();
    else return this.verifyPermissionsIOS();
  }

  public verifyPermissionsAndroid() {
    return this.verifyLocationPermission()
      .then((locationAllowed: boolean) => {
        if(locationAllowed) {
          if(Number(this.device.version) >= 10) {
            return this.verifyMotionPermission()
              .then((motionAllowed: boolean) => {
                if(motionAllowed) return true;
              });
          } else {
            return true;
          }
        } else {
          return false;
        }
      });
  }

  public verifyPermissionsIOS() {
    return this.verifyLocationPermission()
      .then((locationAllowed: boolean) => {
        if(locationAllowed) return true;
        else false;
      });
  }

  public verifyLocationPermission() {
    console.log("verifyLocationPermission");
    return this.diagnostic.getLocationAuthorizationStatus().then((status) => {
      console.log(status);
      if (status !== this.diagnostic.permissionStatus.GRANTED) {
        console.log("Not GRANTED");
        return false;
      } else {
        return true;
      }
    });
  }

  public verifyMotionPermission() {
    console.log("verifyMotionPermission");
    if(this.platform.is('android')) {
      return this.androidPermissions.checkPermission('android.permission.ACTIVITY_RECOGNITION')
        .then(status => {
          console.log(status);
          if (!status.hasPermission) {
            console.log("Not GRANTED");
            return false;
          } else {
            return true;
          }
        })
    } else {
      return Promise.resolve(true);
    }
  }

  public goToSettings() {
    return this.diagnostic.switchToSettings();
  }

  public goToLocationSettings() {
    return this.diagnostic.requestLocationAuthorization(this.diagnostic.locationAuthorizationMode.ALWAYS)
      .then(status => {
        console.log("STATUS", status);
        if(status === this.diagnostic.permissionStatus.GRANTED) return true;
        else return false;
      })
      .catch(error => {
        console.error(error);
        return false;
      });
  }

  public goToMotionSettings() {
    if(this.platform.is('android')) {
      return this.androidPermissions.requestPermission('android.permission.ACTIVITY_RECOGNITION')
        .then(status => {
          console.log("STATUS", status);
          if(status.hasPermission) return true;
          else return false;
        })
        .catch(error => {
          console.error(error);
          return false;
        });
    } else {
      return this.diagnostic.requestRuntimePermission('android.permission.ACTIVITY_RECOGNITION')
        .then(status => {
          console.log("STATUS", status);
          if(status === this.diagnostic.permissionStatus.GRANTED) return true;
          else return false;
        })
        .catch(error => {
          console.error(error);
          return false;
        });
    }
  }
}
