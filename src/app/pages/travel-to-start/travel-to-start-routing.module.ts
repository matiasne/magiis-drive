import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelToStartPage } from './travel-to-start';
import { TravelToStartModule } from './travel-to-start.module';



const routes: Routes = [
  {
    path: '',
    component: TravelToStartPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelToStartRoutingModule {}
