import { NgModule } from '@angular/core';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AngularFireModule } from '@angular/fire/compat';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { AppSettings } from './services/app-settings';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  TranslateLoader,
  TranslateModule,
  TranslateService,
  TranslateStore,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
//import { Keyboard } from '@ionic-native/keyboard/ngx';
import { LaunchNavigator } from '@awesome-cordova-plugins/launch-navigator/ngx';
import { FirebaseService } from './services/firebase.service';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
//import { NativeAudio } from '@awesome-cordova-plugins/native-audio/ngx';
import { Network } from '@awesome-cordova-plugins/network/ngx';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { GooglePlacesService } from './services/google-places.service';
import { Diagnostic } from '@awesome-cordova-plugins/diagnostic/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AppVersion } from '@awesome-cordova-plugins/app-version/ngx';
import { CallService } from './services/call.service';
import { CallNumber } from '@awesome-cordova-plugins/call-number/ngx';
//import { Base64 } from '@ionic-native/base64/ngx';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TravelImagesService } from './services/travel-images.service';
import { ServiceDemoService } from './services/service-demo.service';
import { Camera } from '@awesome-cordova-plugins/camera/ngx';
import { StatusBar } from "@awesome-cordova-plugins/status-bar/ngx";

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AngularFireModule.initializeApp(AppSettings.FIREBASE_CONFIG),

    HttpClientModule,

    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      isolate: false,
    }),
    AppRoutingModule,
    FormsModule,
    CommonModule
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    TranslateService,
    TravelImagesService,
    TranslateStore,
    LaunchNavigator,
    FirebaseService,
    FCM,
    StatusBar, 
    //{ provide: FCM, useValue: { getToken: () => Promise.resolve(true) } },
    //NativeAudio,
    TranslateService,
    Network,
    Device,
    GooglePlacesService,
    Diagnostic,
    AndroidPermissions,
    AppVersion,
    CallService,
    CallNumber,
    Camera,
    //Base64,
    ServiceDemoService
  ],
  bootstrap: [AppComponent,],
})
export class AppModule { }

export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}
