import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelNewDestinationModal } from './travel-new-destination';
import { TravelNewDestinationRoutingModule } from './travel-new-destination-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports: [
    IonicModule,
    TranslateModule.forChild({
      // insolate:false
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
    TravelNewDestinationRoutingModule
  ],
  declarations: [TravelNewDestinationModal],
  entryComponents: [
    TravelNewDestinationModal,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelNewDestinationModule {}
