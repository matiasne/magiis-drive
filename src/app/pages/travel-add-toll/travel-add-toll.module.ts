
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelAddTollModal } from './travel-add-toll';
import { TravelAddTollRoutingModule } from './travel-add-toll-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/app.module';
import { TravelImagesService } from 'src/app/services/travel-images.service';

@NgModule({
  declarations: [TravelAddTollModal],
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
    TravelAddTollRoutingModule
  ],
  entryComponents: [
    TravelAddTollModal,
  ],
  providers: [TravelImagesService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelAddTollModule {}
