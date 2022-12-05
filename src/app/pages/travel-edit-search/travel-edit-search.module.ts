import { NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TravelEditSearchComponent } from './travel-edit-search';
import { TravelEditSearchRoutingModule } from './travel-edit-search-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
      TravelEditSearchComponent
    ],
    imports: [
        TravelEditSearchRoutingModule,
       IonicModule,
       FormsModule,
       CommonModule,
        TranslateModule.forChild({
          // insolate:false
          loader:{
            provide:TranslateLoader,
            useFactory:HttpLoaderFactory,
            deps:[HttpClient]
          }
        }),
        HttpClientModule
    ],
    exports: [
      TravelEditSearchComponent
    ],
    entryComponents: [
      TravelEditSearchComponent
    ],
    providers:[]
})
export class TravelEditSearchModule { }
