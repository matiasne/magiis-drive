import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelAddOtherCostModal } from './travel-add-other';


const routes: Routes = [
  {
    path: '',
    component: TravelAddOtherCostModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelAddOtherRoutingModule {}
