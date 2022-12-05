import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TravelCancelModal } from './travel-cancel';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';

@NgModule({
    declarations: [
      TravelCancelModal,
    ],
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
        PipesModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class TravelCancelModule { }
