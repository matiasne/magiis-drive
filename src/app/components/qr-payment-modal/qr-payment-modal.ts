import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';

@Component({
  selector: 'qr-payment-modal',
  templateUrl: 'qr-payment-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QRPaymentModal {
  url: string;

  constructor(
    private viewCtrl: ModalController,
    private navParams: NavParams
  ) {
    this.url = this.navParams.get('url');
    console.log(this.url);
  }

  ionViewWillEnter() {

  }

  ionViewDidLeave() {

  }

  public dismiss(paymentConfirmed: boolean) {
    this.viewCtrl.dismiss(paymentConfirmed);
  }
}
