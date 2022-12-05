import { Injectable } from "@angular/core";
import { Camera, CameraOptions } from "@awesome-cordova-plugins/camera/ngx";
import { Platform } from "@ionic/angular";


@Injectable({providedIn:'root'})
export class TravelImagesService {

  constructor(
 //   private base64: Base64,
    private camera: Camera,
    private platform: Platform
  ) {}

  async takePicture(): Promise<string> {
    let cameraOptions: CameraOptions = {
      cameraDirection: this.camera.Direction.BACK,
      sourceType: this.camera.PictureSourceType.CAMERA,
      destinationType: this.isIOS()
        ? this.camera.DestinationType.DATA_URL
        : this.camera.DestinationType.NATIVE_URI,
      quality: 50,
      correctOrientation: true,
      targetWidth: 600,
      targetHeight: 600,
      encodingType: this.camera.EncodingType.JPEG,
    };

    return this.camera
      .getPicture(cameraOptions)
      .then(data => {
        if (this.isIOS()) {
          return 'data:image/jpeg;base64,' + data;
        } else {
          return data;//this.base64.encodeFile(data);
        }
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  private isIOS(): boolean {
    return this.platform.is('ios');
  }
}
