import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelEditSearchComponent } from './travel-edit-search';
import { TravelEditSearchModule } from './travel-edit-search.module';





const routes: Routes = [
  {
    path: '',
    component: TravelEditSearchComponent
  
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelEditSearchRoutingModule {}
