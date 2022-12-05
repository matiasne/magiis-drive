import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy,

} from '@angular/core';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { TravelService } from '../../services/travel.service';
import { PlaceModel } from '../../models/place.model';
import { SplitAdressModel } from '../../models/split-adress.model';
import { ModalController, Platform, } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-travel-new-destination',
  templateUrl: 'travel-new-destination.html',
  styleUrls:['travel-new-destination.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TravelNewDestinationModal {
  travel: CurrentTravelModel;
  destinations: Array<SplitAdressModel>;
  autoShowmap = false;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private modalCtrl: ModalController,
    private platform: Platform,
    private travelService: TravelService,
    private activitedRoute: ActivatedRoute
  ) {
    this.destinations = new Array<SplitAdressModel>();
    this.autoShowmap = this.activitedRoute.snapshot.params['showMap'];
  }

  ionViewWillEnter() {
    this.travel = this.travelService.currentTravel;
    this.loadPlaces(this.travel.pendingWaypoints, this.travel.visitedWaypoints);
  }

  ionViewDidLeave() {
    this.changeDetector.detach();
  }

  private loadPlaces(pendingWaypoints: PlaceModel[], visitedWaypoints: PlaceModel[]): void {
    pendingWaypoints.forEach((destination) => {
      if(!visitedWaypoints || !visitedWaypoints.find(waypoint => waypoint.id === destination.id)) {
        this.destinations.push(this.parseDirection(destination.shortName));
      }
    });
    if(this.travel.roundTrip)
      {this.destinations.push(this.parseDirection(this.travel.origin.shortName));}
    else
      {this.destinations.push(this.parseDirection(this.travel.destination.shortName));}

    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  selectDestination(index: number) {
    this.travelService.goToNewDestination(index);
    this.loadNextSegment();
    this.dismiss();
  }

  cancel() {
    this.dismiss();
  }

  private dismiss(data?: any) {
    if (data) {this.modalCtrl.dismiss(data);}
    else {this.modalCtrl.dismiss();}
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  private parseDirection(direction: string): SplitAdressModel {
    const index = direction.indexOf(',', 0);
    const direction_line_one = direction.substr(0, index + 1);
    const direction_line_two = direction.substr(index + 2, direction.length);

    return new SplitAdressModel(direction_line_one, direction_line_two);
  }

  private loadNextSegment() {
    if (this.autoShowmap) {
      if (this.platform.is('ios'))
        {this.travelService.navigateToDestination('ios');}
      else if (this.platform.is('android'))
        {this.travelService.navigateToDestination('android');}
    }
  }
}
