import { NgModule } from '@angular/core';
import { RequiredPermissionPage } from './required-permission';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { PipesModule } from '../../pipes/pipes.module';
import { IonicModule } from '@ionic/angular';
import { RequiredPermissionRoutingModule } from './required-permission-routing.module';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    IonicModule,
    PipesModule,
    CommonModule,
    TranslateModule.forChild({
      //isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
    RequiredPermissionRoutingModule
  ],
  declarations: [RequiredPermissionPage]
})

export class RequiredPermissionModule { }
