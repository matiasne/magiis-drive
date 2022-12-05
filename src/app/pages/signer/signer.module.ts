import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from 'src/app/app.module';
import { CanvasDraw } from 'src/app/components/canvas-draw/canvas-draw';
import { ComponentsModule } from 'src/app/components/components.module';
import { SignerPage } from './signer';
import { SignerRoutingModule } from './signer-routing.module';

@NgModule({
  declarations: [
    SignerPage
  ],
  imports: [
    ComponentsModule,
    IonicModule,SignerRoutingModule, TranslateModule.forChild({
      // isolate: false
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [ HttpClient ]
      }
    }),
  ],
})
export class SignerPageModule {}
