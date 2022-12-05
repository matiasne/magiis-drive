import { Component, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from '../../services/loading-service';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { TravelService } from '../../services/travel.service';
import { PlaceModel } from '../../models/place.model';
import { SplitAdressModel } from '../../models/split-adress.model';
import { ModalController, Platform, NavParams } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-travel-next-destination',
  templateUrl: 'travel-next-destination.html',
  styleUrls:['travel-next-destination.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelNextDestinationModal {

  travel: CurrentTravelModel;
  nextDestination: SplitAdressModel = new SplitAdressModel();
  currentDestination: SplitAdressModel = new SplitAdressModel();
  autoShowmap: boolean = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private platform: Platform,
    private travelService: TravelService,
    private loadingService: LoadingService,
    private activatedRoute: ActivatedRoute
  ) {
    this.autoShowmap = this.activatedRoute.snapshot.params['showMap'];
  }

  ionViewWillEnter() {
    this.travel = this.travelService.currentTravel;
    this.loadPlaces(
      this.travelService.nextDestination,
      this.travelService.currentDestination
    );
  }

  ionViewDidLeave() {
    this.changeDetector.detach();
  }

  private loadPlaces(
    nextDestination: PlaceModel,
    currentDestination: PlaceModel
  ): void {
    this.nextDestination = this.parseDirection(nextDestination.shortName);
    this.currentDestination = this.parseDirection(currentDestination.shortName);
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  goNextDestination() {
    this.travelService.goToNextDestination();
    this.loadNextSegment();
    this.dismiss();
  }

  continueDestination() {
    this.loadingService.show();
    this.travelService.setRealVisitedWaypoint();
    this.travelService.currentTravel.additionalStops++;
    this.travelService.saveCurrentTravel();
    this.loadNextSegment();
    this.loadingService.hide();
    this.dismiss();
  }

  cancel() {
    this.dismiss();
  }

  private dismiss(data?: any) {
    if(data) this.modalCtrl.dismiss(data);
    else this.modalCtrl.dismiss();
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  private parseDirection(direction: string): SplitAdressModel {

    const index = direction.indexOf(',', 0);
    const direction_line_one =  direction.substr(0, index + 1);
    const direction_line_two =  direction.substr(index + 2, direction.length);

    return  new SplitAdressModel(
      direction_line_one,
      direction_line_two
    );

  }

  private loadNextSegment() {
    if (this.autoShowmap) {
      if (this.platform.is('ios'))
        this.travelService.navigateToDestination('ios');
      else if (this.platform.is('android'))
        this.travelService.navigateToDestination('android');
    }

  }

}
