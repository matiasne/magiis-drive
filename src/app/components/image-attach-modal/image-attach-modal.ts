import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TravelImages } from '../../services/enum/travel-images.enum';
import { TravelImagesService } from '../../services/travel-images.service';
import { ModalController, NavParams, Platform } from '@ionic/angular';

@Component({
  selector: 'app-page-image-attach-modal',
  templateUrl: 'image-attach-modal.html',
  styleUrls: ['image-attach-modal.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageAttachModalPage {
  form: FormGroup;
  type: TravelImages;
  item: any;
  canUploadImage: boolean;

  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private ref: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private travelImagesService: TravelImagesService,
    private viewCtrl: ModalController
  ) {
    this.type = this.navParams.get('type');
    this.item = this.navParams.get('ticket');
    this.canUploadImage = ['ITollDetailResponse', 'IParkingDetailResponse'].includes(this.item.constructor.name);
    this.buildForm();
  }
  get name() {
    return this.form.get('name');
  }
  get price() {
    return this.form.get('price');
  }

  ionViewWillEnter() {
    this.loadForm(this.item.name, this.item.price);
    this.updateView();
  }

  cancel() {
    this.dismiss();
  }

  deletePicture() {
    this.item.image = null;
    this.updateView();
  }

  editItem() {
    this.item.name = this.name.value;
    this.dismiss(this.item);
  }

  sanitize(img: string) {
    return this.sanitizer.bypassSecurityTrustUrl(img);
  }

  takePicture() {
    this.travelImagesService
      .takePicture()
      .then((base64File: string) => {
        this.item.image = base64File;
        this.updateView();
      })
      .catch(err => {
        console.log(err);
        this.updateView();
      });
  }

  updateView() {
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
  * Inicializa los FormControls.
  */
  private buildForm() {
    this.form = new FormGroup({
      name: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(25),
          Validators.pattern('[A-Za-z0-9_.ñÑ ]+'),
          Validators.required
        ])
      ),
      price: new FormControl(
        {
          value: '',
          disabled: true
        },
        Validators.compose([
          Validators.maxLength(6),
          Validators.pattern('[0-9,.]+'),
          Validators.required
        ])
      )
    });
  }

  private dismiss(data?: any) {
    if (data) {
      this.viewCtrl.dismiss(data);
    }
    else {
      this.viewCtrl.dismiss();
    }
    this.updateView();
  }

  private loadForm(name: string, price: number): void {
    this.name.setValue(name);
    this.price.setValue(price);
  }
}
