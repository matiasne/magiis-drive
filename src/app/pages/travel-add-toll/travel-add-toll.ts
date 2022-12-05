import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TollDetailItemModel } from '../../models/toll-detail-item.model';
import { LoadingService } from '../../services/loading-service';
import { TranslateService } from '@ngx-translate/core';
import { TravelImagesService } from '../../services/travel-images.service';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { ModalController } from '@ionic/angular';


@Component({
  selector: 'app-travel-add-toll',
  templateUrl: 'travel-add-toll.html',
  styleUrls:['travel-add-toll.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelAddTollModal {
  public formToll: FormGroup;

  private currentTravelRemovedSubscription: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private viewCtrl: ModalController,
    private loadingService: LoadingService,
    private translateService: TranslateService,
    public travelImagesService: TravelImagesService,
    public sanitizer: DomSanitizer,
    private travelService: TravelService
  ) {
    this.buildFormToll();
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
   * Crea un nuevo peaje y se lo pasa a la vista que llama al modal.
   */
  public saveNewToll() {
    this.loadingService.show(this.t('travel_add_toll.label_waiting'));
    if (this.formToll.valid) {
      let tollDetailItem = new TollDetailItemModel(
        this.nameToll.value,
        +this.priceToll.value,
        this.imageBase64
          ? this.imageBase64
          : null
      );
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.dismiss(tollDetailItem);
    } else {
      this.dismiss();
    }
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  /**
   * Cancela la creacion de un nuevo peaje.
   */
  public cancelNewToll() {
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
  private buildFormToll() {
    this.formToll = new FormGroup({
      nameToll: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(25),
          Validators.pattern('[A-Za-z0-9_.ñÑ ]+'),
          Validators.required
        ])
      ),
      priceToll: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(6),
          Validators.pattern('[0-9,.]+'),
          Validators.required
        ])
      )
    });
  }

  get nameToll() {
    return this.formToll.get('nameToll');
  }

  get priceToll() {
    return this.formToll.get('priceToll');
  }

  get pictureToll() {
    return this.pictureToll.get('pictureToll');
  }

  updateView() {
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  public getTicketImage(): string {
    return this.imageBase64;
  }

  takePicture() {
    this.travelImagesService
      .takePicture()
      .then((base64File: string) => {
        this.imageBase64 = base64File;
        this.updateView();
      })
      .catch(err => {
        console.log(err);
        this.updateView();
      });
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
