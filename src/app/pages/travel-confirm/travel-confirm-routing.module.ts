import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelConfirmModel } from 'src/app/models/travel-confirm.model';
import { TravelConfirmPage } from './travel-confirm';


const routes: Routes = [
  {
    path: '',
    component: TravelConfirmPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelConfirmRoutingModule {}
