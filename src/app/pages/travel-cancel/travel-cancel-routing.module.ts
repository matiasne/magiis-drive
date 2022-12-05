import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelCancelModal } from './travel-cancel';


const routes: Routes = [
  {
    path: '',
    component: TravelCancelModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelCancelRoutingModule {}
