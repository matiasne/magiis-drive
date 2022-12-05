import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpLoaderFactory } from '../app.module';
import { InputMaskModule } from '../directives/input-mask/input-mask.module';
import { PipesModule } from '../pipes/pipes.module';
import { CanvasDraw } from './canvas-draw/canvas-draw';
import { CreditCardPaymentDataComponent } from './credit-card-payment-data/credit-card-payment-data.component';
import { FabOverlay } from './fab-overlay/fab-overlay';
import { HomeDriverInformationComponent } from './home-driver-information/home-driver-information.component';
import { ImageAttachModalPage } from './image-attach-modal/image-attach-modal';
import { ImageModalComponent } from './image-modal/image-modal.component';
import { ItemAccordionComponent } from './item-accordion/item-accordion';
import { MaggisFabButtonComponent } from './maggis-fab-button/maggis-fab-button';
import { PopPictureComponent } from './pop-picture/pop-picture';
import { QRPaymentModal } from './qr-payment-modal/qr-payment-modal';
import { TravelItemDetailsComponent } from './travel-item-details/travel-item-details';
import { TravelItemDistanceDurationComponent } from './travel-item-distance-duration/travel-item-distance-duration';
@NgModule({
  declarations: [
    HomeDriverInformationComponent,
    CanvasDraw,
    CreditCardPaymentDataComponent,
    FabOverlay,
    ImageModalComponent,
    ItemAccordionComponent,
    MaggisFabButtonComponent,
    PopPictureComponent,
    QRPaymentModal,
    TravelItemDetailsComponent,
    TravelItemDistanceDurationComponent,
    ImageAttachModalPage
  ],
  imports: [
	CommonModule,
    IonicModule,
    TranslateModule.forChild({
      isolate: false,
     loader: {
       provide: TranslateLoader,
       useFactory: HttpLoaderFactory,
       deps: [ HttpClient ]
     }
   }),
    HttpClientModule,
    InputMaskModule,
    ReactiveFormsModule,
    FormsModule,
    PipesModule,
  
  ],
  exports: [
    HomeDriverInformationComponent,
    CanvasDraw,
    CreditCardPaymentDataComponent,
    FabOverlay,
	ImageModalComponent,
	ItemAccordionComponent,
	MaggisFabButtonComponent,
	PopPictureComponent,
	QRPaymentModal,
	TravelItemDetailsComponent,
	TravelItemDistanceDurationComponent,
  ImageAttachModalPage

  ],
})
export class ComponentsModule {}
