import { NgModule, LOCALE_ID } from '@angular/core';
import { TravelDetailPage } from './travel-detail';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TravelDetailRoutingModule } from './travel-detail-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/app.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TravelItemDetailsComponent } from 'src/app/components/travel-item-details/travel-item-details';
import { PopPictureComponent } from 'src/app/components/pop-picture/pop-picture';
import { registerLocaleData } from '@angular/common';
 // importar locales
 import localePy from '@angular/common/locales/es-PY';
 import localePt from '@angular/common/locales/pt';
 import localeEn from '@angular/common/locales/en';
 import localeEsAr from '@angular/common/locales/es-AR';
import { ComponentsModule } from 'src/app/components/components.module';

 // registrar los locales con el nombre que quieras utilizar a la hora de proveer
 registerLocaleData(localePy, 'es');
 registerLocaleData(localePt, 'pt');
 registerLocaleData(localeEn, 'en');
 registerLocaleData(localeEsAr, 'es-Ar');

@NgModule({
  declarations: [
    TravelDetailPage
  ],
  imports: [
   IonicModule,
   ReactiveFormsModule,
    ComponentsModule,
   CommonModule,
   FormsModule,
   TranslateModule.forChild({
    // insolate:false
    loader:{
      provide:TranslateLoader,
      useFactory:HttpLoaderFactory,
      deps:[HttpClient]
    }
  }),
    PipesModule,
    TravelDetailRoutingModule
  ],
  exports:[TravelDetailPage],
  providers: [ { provide: LOCALE_ID, useValue: 'es' } ],
})
export class TravelDetailPageModule {}
