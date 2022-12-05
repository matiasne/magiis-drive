import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { StatsPage } from './stats';


const routes: Routes = [
  {
    path: '',
    component: StatsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class StatsRoutingModule {}
