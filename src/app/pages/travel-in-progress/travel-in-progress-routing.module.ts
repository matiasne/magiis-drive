import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelInProgressPage } from './travel-in-progress';

const routes: Routes = [
  {
    path: '',
    component: TravelInProgressPage

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelInProgressRoutingModule {}
