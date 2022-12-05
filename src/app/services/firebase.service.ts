import { Injectable } from '@angular/core';
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx'; import { TranslateService } from '@ngx-translate/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  constructor(
    private fcm: FCM,
    private translateService: TranslateService,
    public afDB: AngularFireDatabase
  ) { }

  _firebaseToken: string;

  getFirebaseToken(): Promise<string> {
    return this.fcm.getToken().then(token => { console.log("TOKEN ============================================>", token); return token; });
  }
  onNotification() {
    return this.fcm.onNotification();
  }
  onTokenRefresh() {
    return this.fcm.onTokenRefresh();
  }

  public setFirebaseToken(firebaseToken: string) {
    this._firebaseToken = firebaseToken;
  }

  loadNotificationChannels() {
    console.log("Creando Notification Channels");
    this.fcm.createNotificationChannel({
      id: "NEW_TRAVEL", // required
      name: this.translateService.currentLang === 'es' ? 'Viaje asignado' : 'Travel assigned', // no soporta metodo 'instant' de translate
      description: this.translateService.currentLang === 'es' ? 'Pendiente de aceptación' : 'Waiting for acceptance', // parametro opcional, no es mostrado en alerta
      importance: "high",
      visibility: "public",
      sound: "claxon", // the file should located as resources/raw/alert_sound.mp3
      lights: true,
      vibration: true
    })
      .then(() => {
        console.log("Notification Channel creado: NEW_TRAVEL");
      }).catch(() => {
        console.log("ERROR Notification Channel creado: NEW_TRAVEL");
      });
  }
}
