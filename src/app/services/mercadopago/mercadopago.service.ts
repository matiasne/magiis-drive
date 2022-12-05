import { Injectable } from '@angular/core';
import { Mercadopago } from './mercadopago.model';
import { MercadopagoPaymentMethodBin, MercadopagoPaymentMethodId, MercadopagoPaymentMethod, MercadopagoIdentificationTypes, MercadopagoTokenRequest, MercadopagoCard, MercadopagoInstallmentsRequest, MercadopagoInstallmentsResponse } from './mercadopago-api-interfaces';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Observer } from 'rxjs';
import { ValidatorFn, AbstractControl } from '@angular/forms';
import { from } from 'rxjs';

declare let Mercadopago: Mercadopago;

@Injectable({providedIn:'root'})
export class MercadopagoService {
  constructor(private translateService: TranslateService) { }

  init() {
    Mercadopago.setPublishableKey('%%MERCADOPAGO_PUBLISHABLE_KEY%%');
  }

  createToken(data: MercadopagoTokenRequest): Observable<MercadopagoCard> {
    this.clearSession();
    return Observable.create((observer: Observer<MercadopagoCard>) => {
      Mercadopago.createToken(data, (status, response) => {
        if (status >= 200 && status <= 299) {
          observer.next(response);
          observer.complete();
        } else {
          let key = 'credit-card.mercadopago.token_creation.error_code.'+response.cause[0].code.toString();
          let auxMessage= this.translateService.instant(key);
          const errorMsg = (auxMessage != key)
                           ? auxMessage
                           : this.translateService.instant('credit-card.mercadopago.token_creation.error_code.default');
          observer.error(errorMsg);
        }
      });
    });
  }

  public clearSession(){
    Mercadopago.clearSession();
  }

  public getInstallments(installmentsRequest: MercadopagoInstallmentsRequest): Observable<MercadopagoInstallmentsResponse> {
    return Observable.create((observer: Observer<MercadopagoInstallmentsResponse>) => {
      Mercadopago.getInstallments(
        installmentsRequest,
        (status, response) => {
          if (status >= 200 && status <= 299) {
            observer.next(response);
            observer.complete();
          } else {
            let key = 'credit-card.mercadopago.token_creation.error_code.'+response.cause[0].code.toString();
            let auxMessage= this.translateService.instant(key);
            const errorMsg = (auxMessage != key)
                             ? auxMessage
                             : this.translateService.instant('credit-card.mercadopago.token_creation.error_code.default');
            observer.error(errorMsg);
          }
        }
      );
    }
    );
  }

  getIdentificationTypes(): Observable<MercadopagoIdentificationTypes[]> {
    return Observable.create((observer: Observer<MercadopagoIdentificationTypes[]>) => {
      Mercadopago.getIdentificationTypes((status, response) => {
        if (status >= 200 && status <= 299) {
          observer.next(response);
          observer.complete();
        } else {
          const errorMsg = this.translateService.instant('credit-card.mercadopago.token_creation.error_code.default');
          observer.error(errorMsg);
        }
      });
    });
  }

  getPaymentMethods(): MercadopagoPaymentMethod[] {
    return Mercadopago.getPaymentMethods();
  }

  public getPaymentMethod(paymentMethodObj: MercadopagoPaymentMethodBin | MercadopagoPaymentMethodId): Observable<any> {
    return  from(new Promise(resolve => {
      Mercadopago.getPaymentMethod(paymentMethodObj,
        (status, response) => {
          console.log(status, status);
          if (status === 200) {
            resolve(response);
          } else {
            resolve(null);
          }
        }
      );
    }));
  }

  /** Luhn algorithm validator for credit card field */
  static luhnValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return (control.value && Mercadopago.validateLuhn(control.value.replace(/\D/g, '')))
        ? null
        : { 'invalidCreditCard': { value: control.value } };
    };
  }

}
