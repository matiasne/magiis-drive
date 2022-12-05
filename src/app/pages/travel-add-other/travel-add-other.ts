import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '../../services/loading-service';

import { OtherCostDetailItemModel } from '../../models/other-cost-detail-item.model';
import { Subscription } from 'rxjs';
import { TravelService } from '../../services/travel.service';
import { ModalController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';



@Component({
  selector: 'app-travel-add-other',
  templateUrl: 'travel-add-other.html',
  styleUrls:['travel-add-other.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelAddOtherCostModal {
  maxDiscount: number;

  public formOtherCost: FormGroup;

  private currentTravelRemovedSubscription: Subscription;

  constructor(
    private ref: ChangeDetectorRef,
    private viewCtrl: ModalController,
    private loadingService: LoadingService,
    private translateService: TranslateService,
    private activitedRoute:ActivatedRoute,
    private travelService: TravelService,

  ) {
    this.buildForm();
    this.maxDiscount = this.activitedRoute.snapshot.params['maxDiscount'];
  }


  ionViewWillEnter() {
    this.currentTravelRemovedSubscription = this.travelService.currentTravelRemoved$.subscribe((removed: boolean) => {
      if(removed) this.dismiss();
    });
  }

  ionViewDidLeave() {
    this.currentTravelRemovedSubscription.unsubscribe();
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  /**
   * Crea un nuevo estacionamiento y se lo pasa a la vista que llama al modal.
   */
  public saveOtherCost() {
    this.loadingService.show(this.t('travel_add_other_cost.label_waiting'));
    if (this.formOtherCost.valid) {
      let otherCostDetailItem = new OtherCostDetailItemModel(
        this.otherCostName.value,
        +this.otherCostPrice.value
      );
      if (!this.ref['destroyed']) {
        this.ref.detectChanges();
      }
      this.dismiss(otherCostDetailItem);
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
  public cancelNewOtherCost() {
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
  private buildForm() {
    this.formOtherCost = new FormGroup({
      costName: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(25),
          Validators.pattern('[A-Za-z0-9_.ñÑ ]+'),
          Validators.required
        ])
      ),
      costPrice: new FormControl(
        '',
        Validators.compose([
          Validators.maxLength(6),
          Validators.required,
          Validators.min(this.maxDiscount)
        ])
      )
    });
  }

  get otherCostName() {
    return this.formOtherCost.get('costName');
  }

  get otherCostPrice() {
    return this.formOtherCost.get('costPrice');
  }

  updateView() {
    if (!this.ref['destroyed']) {
      this.ref.detectChanges();
    }
  }

  discountAllowed(){
    return ( Number(this.formOtherCost.get('costPrice').value)  + this.maxDiscount)<1? false: true;
  }
}
