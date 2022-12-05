import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelNextDestinationModal } from './travel-next-destination';
import { TravelNextDestinationRoutingModule } from './travel-next-destination-routing.module';
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
    TravelNextDestinationRoutingModule
  ],
  declarations: [TravelNextDestinationModal],
  entryComponents: [
    TravelNextDestinationModal,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelNextDestinationModule {}
