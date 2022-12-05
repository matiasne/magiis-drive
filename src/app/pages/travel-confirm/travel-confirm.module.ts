import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';

import { TravelConfirmPage } from './travel-confirm';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { TravelConfirmRoutingModule } from './travel-confirm-routing.module';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [
    TravelConfirmPage,
  ],
  imports: [
    IonicModule,
    FormsModule,
    CommonModule,
    ComponentsModule,
    TranslateModule.forChild({
      // insolate:false
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
    PipesModule,
    TravelConfirmRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelConfirmModule {}
