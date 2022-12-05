import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelAddTollModal } from './travel-add-toll';



const routes: Routes = [
  {
    path: '',
    component: TravelAddTollModal
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelAddTollRoutingModule {}
