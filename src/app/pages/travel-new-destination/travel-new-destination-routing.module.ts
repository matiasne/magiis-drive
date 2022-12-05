import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelNewDestinationModal } from './travel-new-destination';





const routes: Routes = [
  {
    path: '',
    component: TravelNewDestinationModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelNewDestinationRoutingModule {}
