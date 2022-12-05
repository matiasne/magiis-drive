import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignerPage } from './signer';


const routes: Routes = [
  {
    path: '',
    component: SignerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SignerRoutingModule {}
