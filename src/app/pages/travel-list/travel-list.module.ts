import { NgModule } from '@angular/core';
import { TravelListPage } from './travel-list';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { TravelListRoutingModule } from './travel-list-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TravelCodePipe } from '../../../app/pipes/travelCode.pipe';
import { TravelDetailPageModule } from '../travel-detail/travel-detail.module';

@NgModule({
  declarations: [
    TravelListPage
  ],
  imports: [
    FormsModule,
    CommonModule,
    IonicModule,
    TravelListRoutingModule,
    TravelDetailPageModule,
    TranslateModule.forChild({
      // insolate:false
      loader:{
        provide:TranslateLoader,
        useFactory:HttpLoaderFactory,
        deps:[HttpClient]
      }
    }),
  ],
  exports:[]
})
export class TravelListModule {}
