import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AlertsService } from '../../services/common/alerts.service';
import { StatusService } from '../../services/status.service';
import { TravelService } from '../../services/travel.service';

@Component({
  selector: 'app-travel-cancel',
  templateUrl: 'travel-cancel.html',
  styleUrls:['travel-cancel.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelCancelModal {
  private currentTravelRemovedSubscription: Subscription;
  public isIncomingTrip: boolean;

  constructor(
    private viewCtrl: ModalController,
    private travelService: TravelService,
    private statusService: StatusService,
    private alertsService: AlertsService,
    private translateService: TranslateService,
    private navParams: NavParams,
    private changeDetector: ChangeDetectorRef
  ) {}

  ionViewWillEnter() {
    this.isIncomingTrip = this.navParams.get('incomingTrip') ? true : false;
    this.currentTravelRemovedSubscription = this.travelService.currentTravelRemoved$.subscribe((removed: boolean) => {
      if(removed) this.dismiss(null);
    });
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  ionViewDidLeave() {
    this.currentTravelRemovedSubscription.unsubscribe();
  }

  public dismiss(cancelTravel: string) {
    switch(cancelTravel) {
      // No puede cubrir viaje
      case 'CANNOT_COVER':
        this.viewCtrl.dismiss(cancelTravel);
        break;
      // No encontró al pasajero
      case 'PASSENGER_NOT_FOUND':
        this.statusService.canPickUp()
          .then(isInRange => {
            if(isInRange) {
              this.viewCtrl.dismiss(cancelTravel);
            } else {
              this.alertsService.show(
                this.translateService.instant('travel_cancel.error.title'),
                this.translateService.instant('travel_cancel.error.not_in_range')
              );
              this.viewCtrl.dismiss(null);
            }
          });
        break;
      default:
        this.viewCtrl.dismiss(cancelTravel);
        break;
    }
  }
}
