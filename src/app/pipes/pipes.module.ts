import { NgModule } from '@angular/core';
import { TravelCodePipe } from './travelCode.pipe';
import { DistancePipe } from './distance.pipe';
import { DistanceDescriptionPipe } from './distance-description.pipe';

@NgModule({
  declarations: [
    TravelCodePipe,
    DistancePipe,
    DistanceDescriptionPipe,
  ],
  exports:[
    TravelCodePipe,
    DistancePipe,
    DistanceDescriptionPipe,
  ]
})
export class PipesModule { }
