import { HttpClient } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';
import { TravelAddOtherCostModal } from './travel-add-other';
import { TravelAddOtherRoutingModule } from './travel-add-other-routing.module';

@NgModule({
  imports: [
    TravelAddOtherRoutingModule,
    IonicModule,
    TranslateModule.forChild({
      // isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
    ReactiveFormsModule
  ],
  declarations: [TravelAddOtherCostModal],
  entryComponents: [
    TravelAddOtherCostModal,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TravelAddOtherModule {}
