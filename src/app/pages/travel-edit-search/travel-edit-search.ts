import { Component, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { PredictionModel } from '../../models/prediction.model';
import { TravelEditionPlaceItem } from '../../models/travel-edition-place-item.model';
import { GooglePlacesService } from '../../services/google-places.service';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import {  ModalController, Platform } from '@ionic/angular';
import { ActivatedRoute,  } from '@angular/router';


@Component({
  selector: 'app-travel-edit-search',
  templateUrl: 'travel-edit-search.html',
  styleUrls:['travel-edit-search.scss']
  })

export class TravelEditSearchComponent {
  destroy$: Subject<boolean> = new Subject<boolean>();

  @ViewChild('input') searchInput;

  item: TravelEditionPlaceItem;
  locationText: string;
  locationPredictions: any[];
  loading: boolean;

  constructor(
    private googlePlacesService: GooglePlacesService,
    private modalCtrl: ModalController,
    private platform: Platform,
    private activitedRoute: ActivatedRoute,
  ) {
    this.item = this.activitedRoute.snapshot.params['item'];
    this.loading = false;
  }

  ngOnInit() {
    this.item.inputEvent
      .pipe(takeUntil(this.destroy$),debounceTime(500),distinctUntilChanged())
      .subscribe(value => {
        if(value) {
          this.loading = true;
          this.googlePlacesService
            .runGoogleAutocomplete(value)
            .then(places => {
              this.item.predictions = places;
              this.loading = false;
            })
            .catch(() => {});
        } else {
          this.item.predictions = [];
          this.loading = false;
        }
      });

    this.platform.backButton.subscribe(() => {
      this.modalCtrl.dismiss();
    });
  }

  ionViewDidEnter() {
    setTimeout(() => {
      this.searchInput.setFocus();
    }, 200);
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  onLocationTextChange() {
    if (this.locationText) {this.item.inputEvent.next(this.locationText);}
    else {this.resetPlacesCollection();}
  }

  onSelectPlace(place: PredictionModel): void {
    this.resetPlacesCollection();
    this.modalCtrl.dismiss(place);
  }

  onCancel() {
    this.resetPlacesCollection();
    this.modalCtrl.dismiss();
  }

  private resetPlacesCollection(): void {
    this.item.predictions = new Array<PredictionModel>();
    this.item.displayList = false;
    if(this.item.place && this.item.input != this.item.place.shortName) {
      this.item.place = null;
    }
  }
}
