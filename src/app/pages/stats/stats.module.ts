import { NgModule } from '@angular/core';
import { StatsPage } from './stats';
import { PipesModule } from '../../pipes/pipes.module';
import { StatsRoutingModule } from './stats-routing.module';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';

@NgModule({
  declarations: [
    StatsPage,
  ],
  imports: [ CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule.forChild({
      // isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
    StatsRoutingModule,
    PipesModule
  ],
})
export class StatsPageModule {}
