import { HttpClient } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';
import { TravelImagesService } from 'src/app/services/travel-images.service';
import { TravelAddParkingModal } from './travel-add-parking';
import { TravelAddParkingRoutingModule } from './travel-add-parking-routing.module';


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
    ReactiveFormsModule,
    TravelAddParkingRoutingModule
  ],
  providers: [ TravelImagesService],
  declarations: [TravelAddParkingModal],
  entryComponents: [
    TravelAddParkingModal,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelAddParkingModule {}
