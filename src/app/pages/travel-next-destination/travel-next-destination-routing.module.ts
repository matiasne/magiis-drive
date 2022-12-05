import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelNextDestinationModal } from './travel-next-destination';




const routes: Routes = [
  {
    path: '',
    component: TravelNextDestinationModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelNextDestinationRoutingModule {}
