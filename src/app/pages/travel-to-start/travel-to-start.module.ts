import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { TravelToStartRoutingModule } from './travel-to-start-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/app.module';
import { TravelToStartPage } from './travel-to-start';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [TravelToStartPage],
    imports: [
        IonicModule,
        CommonModule,
        TranslateModule.forChild({
          // insolate:false
          loader:{
            provide:TranslateLoader,
            useFactory:HttpLoaderFactory,
            deps:[HttpClient]
          }
        }),
        PipesModule,
        TravelToStartRoutingModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class TravelToStartModule { }
