import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelTransferCostPage } from './travel-transfer-cost';



const routes: Routes = [
  {
    path: '',
    component: TravelTransferCostPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelTransferCostRoutingModule {}
