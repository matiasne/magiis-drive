import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '../../services/loading-service';
import { ParkingDetailItemModel } from '../../models/parking-detail-item.model';
import { DomSanitizer } from '@angular/platform-browser';
import { TravelImagesService } from '../../services/travel-images.service';
import { Subscription } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { ModalController } from '@ionic/angular';
import { ServiceDemoService } from '../../services/service-demo.service';



@Component({
  selector: 'app-travel-add-parking',
  templateUrl: 'travel-add-parking.html',
  styleUrls:['travel-add-parking.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelAddParkingModal {
  public formParking: FormGroup;

  private currentTravelRemovedSubscription: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private viewCtrl: ModalController,
    private loadingService: LoadingService,
    private translateService: TranslateService,
    public sanitizer: DomSanitizer,
    private travelService: TravelService,
    private travelImagesService:TravelImagesService
  ) {
    this.buildFormParking();
  }

  imageSrc: any;
  imageBase64: string = '';

  ionViewWillEnter() {
    this.currentTravelRemovedSubscription = this.travelService.currentTravelRemoved$.subscribe((removed: boolean) => {
      if(removed) this.dismiss();
    });
  }

  ionViewDidLeave() {
    this.currentTravelRemovedSubscription.unsubscribe();
  }

  /**
   * Translator.
   * @param translationKey
   */
  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  /**
   * Crea un nuevo estacionamiento y se lo pasa a la vista que llama al modal.
   */
  public saveNewParking() {
    this.loadingService.show(this.t('travel_add_parking.label_waiting'));
    if (this.formParking.valid) {
      let parkingDetailItem = new ParkingDetailItemModel(
        this.nameParking.value,
        +this.priceParking.value,
        this.imageBase64
          ? this.imageBase64
          : null
      );
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.dismiss(parkingDetailItem);
    } else {
      this.dismiss();
    }
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
   * Cancela la creacion de un nuevo estacionamiento.
   */
  public cancelNewParking() {
    this.dismiss();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
   * Elimina el modal y en caso de recibir algun dato
   * por parametro, se lo pasa a la vista padre.
   * @param data
   */
  private dismiss(data?: any) {
    if (data) this.viewCtrl.dismiss(data);
    else this.viewCtrl.dismiss();
    this.loadingService.hide();
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
   * Inicializa los FromControls.
   */
  private buildFormParking() {
    this.formParking = new FormGroup({
      nameParking: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(25),
          Validators.pattern('[A-Za-z0-9_.ñÑ ]+'),
          Validators.required
        ])
      ),
      priceParking: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(6),
          Validators.pattern('[0-9,.]+'),
          Validators.required
        ])
      )
    });
  }

  get nameParking() {
    return this.formParking.get('nameParking');
  }

  get priceParking() {
    return this.formParking.get('priceParking');
  }

  get pictureParking() {
    return this.pictureParking.get('pictureParking');
  }

  updateView() {
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  takePicture() {
    // this.travelImagesService
    //   .takePicture()
    //   .then((base64File: string) => {
    //     this.imageBase64 = base64File;
    //     this.updateView();
    //   })
    //   .catch(err => {
    //     console.log(err);
    //     this.updateView();
    //   });
  }

  deletePicture() {
    this.imageBase64 = '';
    this.imageSrc = '';
    this.updateView();
  }

  sanitize(img: string) {
    return this.sanitizer.bypassSecurityTrustUrl(img);
  }
}
