import { NgModule } from '@angular/core';
import { RestorePassPage } from './restore-pass';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpLoaderFactory } from 'src/app/app.module';
import { HttpClient } from '@angular/common/http';
import { RestorePassRoutingModule } from './restore-pass-routing.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    RestorePassPage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    ReactiveFormsModule,
    RestorePassRoutingModule,
    TranslateModule.forChild({
      // isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
  ],
})
export class RestorePassPageModule {}
