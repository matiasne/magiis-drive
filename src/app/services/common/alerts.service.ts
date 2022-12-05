import { Injectable } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';

@Injectable({providedIn:'root'})
export class AlertsService {

  public showingOkMessage: boolean;
  public showingMessage: boolean;
  private defaultDuration: number = 3000;

  public alert:any;

  constructor(
    private alertCtrl: AlertController,
    private toasty: ToastController
    ) { }

  /**Common Ok button message*/
  async show(title: string, subtitle: string) {
    this.alert = await this.alertCtrl.create({
      header: title,
      subHeader: subtitle,
      //buttons: ['OK']
      buttons: [{
        text: 'OK',
        handler: () => {
          console.log('Ok clicked');
          this.showingOkMessage = false;
        }
      }]
    });

    if(!this.showingOkMessage) {
      this.showingOkMessage = true;
      this.alert.show;
    }
  }

  clear() {
    if(this.showingOkMessage) {
      this.alert.dismiss();
    }
  }

  async dialog(title: string, message: string, confirmLabel: string, cancelLable: string, confirmAction: any, cancelAction: any): Promise<void> {
    let vm = this;
    if (!vm.showingMessage){
      vm.showingMessage = true;

      const buttons = [
        cancelLable && {
          text: cancelLable,
          role: 'cancel',
          handler: cancelAction
        },
        confirmLabel && {
          text: confirmLabel,
          handler: confirmAction
        }
      ].filter(n => n);

      this.alert = await this.alertCtrl.create({
        header: title,
          message: message,
          buttons: buttons
      });

      this.alert.present();
    }
  }

  public inputDialog(title: string, message: string, inputs:any, scss: string, confirmLabel: string, cancelLable: string, confirmAction: any, cancelAction: any, blockBackdropDismiss?: boolean){
    let vm = this;
    if (!vm.showingMessage){
      vm.showingMessage = true;

      this.alert = this.alertCtrl.create({
        header: title,
          message: message,
          inputs:inputs,
          cssClass: scss,
          backdropDismiss: !blockBackdropDismiss,
          buttons: [{
              text: cancelLable,
              role: 'cancel',
              handler: cancelAction
          },{
              text: confirmLabel,
              handler: (alertData) => { //takes the data
                return confirmAction(alertData)
            }
          }]
      });

      this.alert.present();
    }
  }

  public async tinytoast(message: string, duration?: number, position?: string): Promise<void> {
    const toastRef = await this.toasty.create({
          message: message,
          duration: (duration) ? duration : this.defaultDuration,
          position: 'bottom',
          cssClass: 'tiny-toast'}
          )
          await toastRef.present();
  }

  public toast(message: string, duration?: number, position?: string): void {
    this._toast(
        message,
        (duration) ? duration : this.defaultDuration,
        (position) ? position : 'bottom'
    );
  }

  private async _toast(message: string, duration: number, position: any): Promise<void> {
    const toastRef = await this.toasty.create({
        message: message,
        duration: duration,
        position: position
    })
    
    await toastRef.present();
  }

}
