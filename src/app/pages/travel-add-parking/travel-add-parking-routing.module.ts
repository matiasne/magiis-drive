import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelAddParkingModal } from './travel-add-parking';


const routes: Routes = [
  {
    path: '',
    component: TravelAddParkingModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelAddParkingRoutingModule {}
