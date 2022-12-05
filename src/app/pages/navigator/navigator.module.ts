import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NavigatorPageRoutingModule } from './navigator-routing.module';

import { NavigatorPage } from './navigator.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NavigatorPageRoutingModule
  ],
  declarations: [NavigatorPage]
})
export class NavigatorPageModule {}
