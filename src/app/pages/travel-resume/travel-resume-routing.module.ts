import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TravelResumePage } from './travel-resume';
import { TravelResumeModule } from './travel-resume.module';




const routes: Routes = [
  {
    path: '',
    component: TravelResumePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TravelResumeRoutingModule {}
