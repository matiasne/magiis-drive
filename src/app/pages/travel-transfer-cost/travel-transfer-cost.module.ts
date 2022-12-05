import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelTransferCostPage } from './travel-transfer-cost';
import { TravelTransferCostRoutingModule } from './travel-transfer-routing.module';
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
    TravelTransferCostRoutingModule
  ],
  declarations: [
    TravelTransferCostPage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelTransferCostModule {}
