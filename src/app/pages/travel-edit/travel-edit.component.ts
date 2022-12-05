import {
  Component,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import { PlaceModel } from '../../models/place.model';
import { CurrentTravelModel } from '../../models/current-travel.model';
import { TravelService } from '../../services/travel.service';
import { TravelEditionPlaceItem } from '../../models/travel-edition-place-item.model';
import { TravelUpdate } from '../../models/travel-update.model';
import { Subject, Subscription } from 'rxjs';
import { AlertsService } from '../../services/common/alerts.service';
import { TranslateService } from '@ngx-translate/core';
import { ModalController } from '@ionic/angular';




@Component({
  selector: 'app-travel-edit',
  templateUrl: './travel-edit.component.html',
  styleUrls:['travel-edit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelEditComponent {
  travel: CurrentTravelModel;
  staticWaypoints: TravelEditionPlaceItem[] = [];
  editableWaypoints: TravelEditionPlaceItem[] = [];
  canOrderer = false;

  private readonly labels = {
    end: 'travel_edit.end',
    start: 'travel_edit.start',
    stop: 'travel_edit.stop'
  };

  private currentTravelRemovedSubscription: Subscription;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private travelService: TravelService,
    public modalCtrl: ModalController,
    private alertService: AlertsService,
    private translateService: TranslateService
  ) {}

  addStop() {
    if ((this.staticWaypoints.length + this.editableWaypoints.length) < 6) {
      this.editableWaypoints.push({
        displayList: false,
        input: '',
        place: null,
        predictions: [],
        inputEvent: new Subject(),
        editable: true
      });
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    }
  }

  close() {
    console.log('CURRENT TRAVEL', this.travelService.currentTravel);
    this.modalCtrl.dismiss();
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  dismiss() {
    this.modalCtrl.dismiss(this.generateUpdatedTravel());
    if (!this.changeDetector['destroyed']) {
      if (!this.changeDetector['destroyed']) {
        this.changeDetector.detectChanges();
      }
    }
  }

  getLabel(index: number): string {
    const waypoints = [
      ...this.staticWaypoints,
      ...this.editableWaypoints
    ];

    if (!index) {
      return this.labels.start;
    }

    if (waypoints.length - 1 === index) {
      return this.labels.end;
    }

    return this.labels.stop;
  }

  ionViewWillEnter() {
    this.currentTravelRemovedSubscription = this.travelService.currentTravelRemoved$.subscribe((removed: boolean) => {
      if(removed) {this.dismiss();}
    });

    this.travel = { ...this.travelService.currentTravel};
    this.loadWaypoints();
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  ionViewDidLeave() {
    this.currentTravelRemovedSubscription.unsubscribe();

    this.staticWaypoints.forEach(
      item =>
        item.inputEventSubscriptor && item.inputEventSubscriptor.unsubscribe()
    );
    this.editableWaypoints.forEach(
      item =>
        item.inputEventSubscriptor && item.inputEventSubscriptor.unsubscribe()
    );
    this.changeDetector.detach();
  }

  isValid(): boolean {
    const waypoints = [
      ...this.staticWaypoints,
      ...this.editableWaypoints
    ];
    const waypointsToCheck =
      waypoints.length > 2 ? waypoints.slice(0, -1) : waypoints;

    return waypointsToCheck.every(w => !!w.place && !!w.input);
  }

  placeSelected(item: TravelEditionPlaceItem): void {
    /* Alert confirm action **/
    const confirmAction = () => {
      this.alertService.clear();
      this.alertService.showingMessage = false;
    };

    /* Check static waypoint with editable waypoints**/
    if(this.staticWaypoints[0].input === this.editableWaypoints[0].input) {
      this.alertService.dialog(
        null,
        this.translateService.instant('travel_edit.invalid_destination'),
        this.translateService.instant('buttons.ok'),
        null,
        confirmAction,
        null
      );
      this.editableWaypoints.pop();
      this.addStop();
    }

    /* Check static waypoint with editable waypoints**/
    const finalPosition = this.editableWaypoints.length - 1;
    const previousPosition = finalPosition - 1;
    if (this.editableWaypoints[previousPosition].input === this.editableWaypoints[finalPosition].input) {
      this.alertService.dialog(
        null,
        this.translateService.instant('travel_edit.invalid_destination'),
        this.translateService.instant('buttons.ok'),
        null,
        confirmAction,
        null
      );
      this.editableWaypoints.pop();
      this.addStop();
    }

    if (this.editableWaypoints.indexOf(item) === this.editableWaypoints.length - 1) {
      this.addStop();
      this.canOrderer = this.editableWaypoints.length > 2;
    }
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  removeItem(index: number) {
    let removedWaypoint: TravelEditionPlaceItem;

    // Remove last item.
    if (index ===  (this.staticWaypoints.length + this.editableWaypoints.length - 1)) {
      removedWaypoint = this.editableWaypoints.pop();
      /* In trips roundTrip the last element always is the origin,
      If it was deleted => roundTrip = false */
      this.travel.roundTrip = false;
      this.addStop();
    } else if (index > this.staticWaypoints.length - 1) {
      removedWaypoint = this.editableWaypoints
        .splice(index - this.staticWaypoints.length, 1)[0];
    }

    if (removedWaypoint.inputEventSubscriptor)
      {removedWaypoint.inputEventSubscriptor.unsubscribe();}

    this.canOrderer = this.editableWaypoints.length > 2;
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  reorderItems(ev: any) {
    alert("Aplicar logica para reordenar los items")
    //const lastElement: TravelEditionPlaceItem = this.editableWaypoints.pop();

    //this.editableWaypoints = reorderArray(this.editableWaypoints, indexes);

   // this.editableWaypoints.push(lastElement);
   // if (!this.changeDetector['destroyed']) {
   //   this.changeDetector.detectChanges();
  //  }
  }

  setRoundTrip(index: number) {
    const originPlace = Object.assign({}, this.staticWaypoints[0]);
    originPlace.editable = true;
    this.editableWaypoints[index - this.staticWaypoints.length] = originPlace;
    this.travel.roundTrip = true;
    if (!this.changeDetector['destroyed']) {
      this.changeDetector.detectChanges();
    }
  }

  private createItem(place: PlaceModel, visited: boolean): TravelEditionPlaceItem {
    const item: TravelEditionPlaceItem = {
      displayList: false,
      input: place.shortName,
      place: Object.assign({}, place),
      predictions: [],
      inputEvent: new Subject(),
      editable: !visited
    };

    return item;
  }

  private generateUpdatedTravel(): TravelUpdate {
    const travel = new TravelUpdate();
    travel.avoidHighways = this.travel.avoidHighways;
    travel.avoidTolls = this.travel.avoidTolls;
    travel.id = this.travel.travelId;
    travel.note = this.travel.note;
    travel.roundTrip = this.travel.roundTrip;
    const waypoints = [
      ...this.staticWaypoints,
      ...this.editableWaypoints
    ];

    let lastPlace = waypoints.pop();
    if (!lastPlace.place || !lastPlace.input || this.travel.roundTrip) {
      // In trips rounTrip, I discard the last element of waypoints
      lastPlace = waypoints.pop();
    }

    travel.destination = lastPlace.place;
    delete travel.destination.id;
    travel.origin = waypoints.shift().place;
    /* Remove the ID of the places visited */
    waypoints.forEach(w => {
      if (w.editable) {delete w.place.id;}
    });
    travel.waypoints = waypoints.map(w => w.place);

    return travel;
  }

  private loadWaypoints() {
    // Fixed undefined objects.
    const visitedWaypoints = this.travel.visitedWaypoints || [];
    const pendingWaypoints = this.travel.pendingWaypoints || [];

    // Visited Places.
    this.staticWaypoints = [
      this.createItem(this.travel.origin, true), //visitado
      ...visitedWaypoints.map(vW => this.createItem(vW, true))
    ];
    // Pending Places.
    this.editableWaypoints = [
      ...pendingWaypoints.map(pW => this.createItem(pW, false))
    ];

    // Evaluate Round Trip.
    if (this.travel.roundTrip) {
      this.editableWaypoints.push(
        this.createItem(this.travel.origin, false)
      );
    } else {
      this.editableWaypoints.push(
        this.createItem(this.travel.destination, false)
      );
      this.addStop();
    }
    // Evaluate Orderer
    this.canOrderer = this.editableWaypoints.length > 2;
    /* check if it is open to discard the first item which is equal to the source address **/
    (
      this.travel.fromName === this.travel.toName &&
      !this.travel.roundTrip &&
      (!this.travel.waypoints || this.travel.waypoints.length === 0)
    ) && this.editableWaypoints.shift(); /* discard the first item **/
  }

}
