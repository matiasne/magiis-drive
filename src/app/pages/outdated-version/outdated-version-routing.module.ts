import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OutdatedVersionPage } from './outdated-version';


const routes: Routes = [
  {
    path: '',
    component: OutdatedVersionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OutdatedVersionRoutingModule {}
