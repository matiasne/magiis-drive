import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelEditComponent } from './travel-edit.component';





const routes: Routes = [
  {
    path: '',
    component: TravelEditComponent

  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelEditRoutingModule {}
