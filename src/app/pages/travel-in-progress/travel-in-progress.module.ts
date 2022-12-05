import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TravelInProgressPage } from './travel-in-progress';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelAddParkingModule } from '../travel-add-parking/travel-add-parking.module';
import { PipesModule } from '../../pipes/pipes.module';
import { OpenNativeSettings } from '@awesome-cordova-plugins/open-native-settings/ngx';
import { TravelInProgressRoutingModule } from './travel-in-progress-routing.module';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';

@NgModule({
    declarations: [
      TravelInProgressPage
    ],
    imports: [
        TranslateModule.forChild({
          // insolate:false
          loader:{
            provide:TranslateLoader,
            useFactory:HttpLoaderFactory,
            deps:[HttpClient]
          }
        }),
        IonicModule,
        TravelAddParkingModule,
        PipesModule,
        TravelInProgressRoutingModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [OpenNativeSettings]
})

export class TravelInProgressModule { }
