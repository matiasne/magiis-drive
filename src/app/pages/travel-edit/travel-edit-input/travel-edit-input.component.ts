import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { TravelEditionPlaceItem } from '../../../models/travel-edition-place-item.model';
import { GooglePlacesService } from '../../../services/google-places.service';
import { TravelEditSearchComponent } from '../../travel-edit-search/travel-edit-search';


@Component({
  selector: 'travel-edit-input',
  templateUrl: './travel-edit-input.component.html',
  styleUrls:['travel-edit-input.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TravelEditInputComponent implements OnInit {
  @Input() index: number;
  @Input() isMultiple: boolean;
  @Input() isRound: boolean;
  @Input() item: TravelEditionPlaceItem;
  @Input() last: boolean;
  @Input() label: string;

  @Output() placeSelected = new EventEmitter<TravelEditionPlaceItem>();
  @Output() removeItem = new EventEmitter<number>();
  @Output() setRoundTrip = new EventEmitter<number>();

  constructor(
    private changeDetector: ChangeDetectorRef,
    private googlePlacesService: GooglePlacesService,
    private popoverController: PopoverController
  ) {}

  ngOnInit() {}

  async onFocus(item: any): Promise<void> {

    const popover = await this.popoverController.create({
      component:TravelEditSearchComponent,
      componentProps:{ item: item},
      cssClass: 'magiis-carrier-popover'
  });
    popover.dismiss((place) => {
      if(place) {
        this.googlePlacesService.geocode(place).then(place => {
          item.place = place;
          item.input = place.shortName;
          this.placeSelected.emit(item);
          if (!this.changeDetector['destroyed']) {
            this.changeDetector.detectChanges();
          }
        });
      }
    });
		popover.present();
  }
}



