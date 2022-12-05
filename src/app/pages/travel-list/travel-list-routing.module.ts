import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelListPage } from './travel-list';



const routes: Routes = [
  {
    path: '',
    component: TravelListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelListRoutingModule {}
