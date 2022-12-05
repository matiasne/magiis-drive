import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelResumePage } from './travel-resume';
// Modals.
import { TravelAddTollModule } from '../travel-add-toll/travel-add-toll.module';
import { TravelAddParkingModule } from '../travel-add-parking/travel-add-parking.module';

// Pipes
import { PipesModule } from '../../pipes/pipes.module';
import { TravelResumeRoutingModule } from './travel-resume-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/app.module';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    IonicModule,
    ComponentsModule,
    TranslateModule.forChild({
      // insolate:false
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
    TravelAddTollModule,
    TravelAddParkingModule,
    PipesModule,
    TravelResumeRoutingModule
  ],
  declarations: [
    TravelResumePage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelResumeModule {}
