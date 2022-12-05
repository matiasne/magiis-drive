import { LoadingController } from '@ionic/angular';
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({providedIn:'root'})
export class LoadingService {
  loading: any = null;
  constructor(
    private loadingCtrl: LoadingController,
    private translateService: TranslateService
  ) {}

  public async show(message?: string) {
    if (this.loading == null) {
      this.loading = await this.loadingCtrl.create({
        message: message == null ? this.translateService.instant("Loading") : message,
      });
      this.loading.present();
    } else {
      this.loading.setContent((message == null ? this.translateService.instant("Loading") : message));
    }
  }

  public hide() {
    if (this.loading != null) {
      this.loading.dismiss();
      this.loading = null;
    }
  }
}
