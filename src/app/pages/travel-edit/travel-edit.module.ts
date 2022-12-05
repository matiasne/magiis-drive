import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TravelEditComponent } from './travel-edit.component';
import { TravelEditInputComponent } from './travel-edit-input/travel-edit-input.component';
import { TravelEditRoutingModule } from './travel-edit.component-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpLoaderFactory } from 'src/app/app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [TravelEditComponent, TravelEditInputComponent],
  imports: [
    TravelEditRoutingModule,IonicModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
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
  exports: [TravelEditComponent],
  entryComponents: [TravelEditComponent],
  schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class TravelEditPageModule {}
