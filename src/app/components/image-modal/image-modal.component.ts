import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { Camera, CameraOptions } from '@awesome-cordova-plugins/camera/ngx';
//import { ImagePicker } from '@ionic-native/image-picker/ngx';
import { Crop, CropOptions } from '@ionic-native/crop/ngx';

@Component({
  selector: 'app-ImageModal',
  templateUrl: './image-modal.component.html'
})
export class ImageModalComponent implements OnInit {

  sliderOpts = {
    zoom: {
        maxRatio: 3
    }
  }

  editable:false;
  image: HTMLImageElement = new Image();
  imageBkp : String;
  defaultImgPath : String;
  constructor(private navParams:NavParams,
              public viewCtrl: ModalController,
              //private imagePicker: ImagePicker,
              private crop: Crop,
           //   private base64: Base64,
              private camera: Camera
              ) {

    this.image = this.navParams.get('img');
    this.editable = this.navParams.get('editable');
    this.defaultImgPath = this.navParams.get('defaultImgPath');
    this.imageBkp = new String(this.image.src);
  }

  ngOnInit() {
  }


  close(confirm:boolean){
    if (!confirm) this.image.src = this.imageBkp.toString();
    this.viewCtrl.dismiss();
  }

  changePicture() {
    this.camera.cleanup();

    let options= {
        maximumImagesCount: 1,
    }

    /*this.imagePicker.getPictures(options).then((results) => {
        this.crop.crop(results[0], {quality: 100}).then(
            newImage => {
              console.log(newImage);
              this.setImage(newImage);
            },
            error => console.error('Error cropping image', error)
        );
    }, (err) => {throw err; });*/
  }

  public setImage(filePath: string) {
    /*this.base64.encodeFile(filePath).then((base64File: string) => {
        this.image.src = base64File;
    }, (err) => {
        console.error(err);
        throw err;
    });*/

    this.image.src = filePath;
  }

 takePicture() {
    let cameraOptions: CameraOptions = {
      cameraDirection: this.camera.Direction.FRONT,
      sourceType: this.camera.PictureSourceType.CAMERA,
      quality: 50,
      destinationType: this.camera.DestinationType.FILE_URI,
			mediaType: this.camera.MediaType.ALLMEDIA,
			encodingType: this.camera.EncodingType.JPEG,
      correctOrientation: true
    };

    return this.camera
      .getPicture(cameraOptions)
      .then(data => {
          this.crop.crop(data, {quality: 100}).then(
            newImage => {
              console.log(newImage);
              this.setImage(newImage);
            },
            error => console.error('Error cropping image', error)
        );
      })
      .catch(err => {
        console.log(err);
        throw err;
      });
  }

  remove(){
    this.image.src = this.defaultImgPath.toString();
  }

}
