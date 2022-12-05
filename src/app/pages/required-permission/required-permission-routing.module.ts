import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RequiredPermissionPage } from './required-permission';


const routes: Routes = [
  {
    path: '',
    component: RequiredPermissionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class RequiredPermissionRoutingModule {}
