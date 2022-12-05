import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TravelChatPage } from './travel-chat';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { TravelChatRoutingModule } from './travel-chat-routing.module';
import { IonicModule } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { HttpLoaderFactory } from 'src/app/app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
      TravelChatPage,

    ],
    imports: [
        IonicModule,
        ReactiveFormsModule,
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
        PipesModule,
        TravelChatRoutingModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class TravelChatModule { }
