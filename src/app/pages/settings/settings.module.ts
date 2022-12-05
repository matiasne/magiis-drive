import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SettingsPage } from './settings';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { SettingsRoutingModule } from './settings-routing.module';
import { HttpLoaderFactory } from 'src/app/app.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    SettingsPage,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
  imports: [
    IonicModule,
    FormsModule,
    TranslateModule.forChild({
      // isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
    SettingsRoutingModule
  ],
})
export class SettingsPageModule {}
