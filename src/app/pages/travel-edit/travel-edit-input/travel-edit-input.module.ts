import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelDetailModule } from './travel-detail';




const routes: Routes = [
  {
    path: '',
    component: TravelEditInputModule

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelEditInputRoutingModule {}
