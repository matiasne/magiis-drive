import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { AlertsService } from '../../services/common/alerts.service';
import { MercadopagoService } from '../../services/mercadopago/mercadopago.service';
import { MercadopagoIdentificationTypes, MercadopagoPaymentMethod, MercadopagoTokenRequest, MercadopagoInstallmentsRequest, MercadopagoInstallmentsResponse, MercadopagoCard } from '../../services/mercadopago/mercadopago-api-interfaces';
import { TranslateService } from '@ngx-translate/core';
import { CreditCardImg, CreditCardMask, CreditCardRegex, CreditCardType } from '../../services/enum/credit-card.enum';
import { ModalController, NavParams, Platform } from '@ionic/angular';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'credit-card-payment-data',
  templateUrl: './credit-card-payment-data.component.html'
})

export class CreditCardPaymentDataComponent {

  public identificationTypes: MercadopagoIdentificationTypes[];
  public currentIdentificationType: MercadopagoIdentificationTypes;
  public thumbnail: string;
  public mercadopagoPaymentMethod:MercadopagoPaymentMethod;
  public creditCardPattern: string;
  public template: string;
  public disabledDocNumber: boolean = true;
  public disabledForm: boolean = true;
  public creditCardIssuerId: string;
  public securityCodeLength: number;
  public creditCardType: string; 
  public readonly TEMPLATE_PAYMENT = 'payment';
  public readonly TEMPLATE_HELP_EXPIRATION_DATE = 'helpExpirationDate';
  public readonly TEMPLATE_HELP_SECURITY_CODE = 'helpSecurityCode';

  public readonly PATTERN_AMEX: string = "**** ****** *****";
  public readonly PATTERN_STANDAR: string = "**** **** **** ****";

  public amount: number;
  public retryCardData: any;
  public appCode: string;

  formGroup: FormGroup;

  constructor(
    private navParams: NavParams,
    private formBuilder: FormBuilder,
    private viewCtrl: ModalController,
    private alertService: AlertsService,
    private translateService: TranslateService,
    private platform: Platform,
    private mercadopagoService: MercadopagoService) {

    this.amount = this.navParams.get('amount');
    this.retryCardData = this.navParams.get('retryCardData');
    this.appCode = this.navParams.get('appCode');

    this.template = this.TEMPLATE_PAYMENT;

    if(!this.retryCardData)
      this.createForm();
    else
      this.createRetryForm(this.retryCardData);

    this.mercadopagoService.getIdentificationTypes().subscribe((rta) => {
      this.identificationTypes = rta;
    },
      (error) => {
        this.alertService.show(this.t("credit-card.error_unknown_title"), this.t("credit-card.error_unknown"));
      });

    this.platform.backButton.subscribe(() => {
      this.dismiss();
    });
    this.creditCardPattern = this.PATTERN_STANDAR;
    this.thumbnail = CreditCardImg.DEFAULT;
  }

  createForm() {
    this.formGroup = this.formBuilder.group({
      cardNumber: new FormControl(null,
        [
          Validators.required,
          Validators.pattern('[0-9 ]+'),
          MercadopagoService.luhnValidator()
        ]),
      cardExpirationDate: new FormControl(null,
        [
          Validators.required,
          this.expiryDateValidator()
        ]),
      securityCode: new FormControl(null,
        [
          Validators.required,
          Validators.pattern('[0-9]+'),
          this.checkSecurityCodeLength()
        ]),
      docType: new FormControl(null,
        [
          Validators.required
        ]),
      docNumber: new FormControl(null,
        [
          Validators.required,
          this.checkDocNumber()
        ]),
      cardholderName: new FormControl(null,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z-' ]+")
        ]),
        updateOn: 'chan'
    })
  }

  createRetryForm(retryData) {
    this.formGroup = this.formBuilder.group({
      cardNumber: new FormControl(retryData.cardNumber,
        [
          Validators.required,
          Validators.pattern('[0-9 ]+'),
          MercadopagoService.luhnValidator()
        ]),
      cardExpirationDate: new FormControl(retryData.cardExpirationDate,
        [
          Validators.required,
          this.expiryDateValidator()
        ]),
      securityCode: new FormControl(retryData.securityCode,
        [
          Validators.required,
          Validators.pattern('[0-9]+'),
          this.checkSecurityCodeLength()
        ]),
      docType: new FormControl(retryData.docType,
        [
          Validators.required
        ]),
      docNumber: new FormControl(retryData.docNumber,
        [
          Validators.required,
          this.checkDocNumber()
        ]),
      cardholderName: new FormControl(retryData.cardholderName,
        [
          Validators.required,
          Validators.pattern("[a-zA-Z-' ]+")
        ]),
        updateOn: 'chan'
    });

    this.verifyCreditCard();
  }

  private checkSecurityCodeLength(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return (
        (control.value && control.value.length != this.securityCodeLength)
          ? { 'invalidSecurityCode': { value: control.value } }
          : null)
    };
  }

  checkDocNumber(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      return (
        (control.value && this.currentIdentificationType &&
          (control.value.length < this.currentIdentificationType.min_length ||
            control.value.length > this.currentIdentificationType.max_length))
          ? { 'invalidDocNumber': { value: control.value } }
          : null)
    };
  }

  expiryDateValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      const today = new Date();
      if (control.value && control.value.length < 5) {
        return { 'invalidExpiryDate': { value: control.value } }
      }
      if (control.value && control.value.toString().substr(0, 2) > 12) {
        return { 'invalidExpiryDate': { value: control.value } }
      }
      if (control.value){
        const expiryDate = new Date(Number('20'.toString() + control.value.toString().substr(3, control.value.toString().length)),
        Number(control.value.toString().substr(0, 2)) + 1,0);
        if (today > expiryDate) {
          return { 'invalidExpiryDate': { value: control.value } }
        }
      }

    };
  }

  verifyCreditCard() {
    let cardNumber = this.formGroup.value.cardNumber.replace(/\D/g, '')
    if (cardNumber.length < 3) {
      this.thumbnail = CreditCardImg.DEFAULT;
      return;
    }

    (<any>Object).values(this.formGroup.controls).forEach(control => {
      control.markAsTouched();
    })

    this.disabledForm = false;
    const cardIcon: CreditCardImg = this.getCardIcon(`${cardNumber}`);
    if (this.thumbnail !== cardIcon) {
      this.thumbnail = cardIcon;
      this.creditCardType = this.getCardType(`${cardNumber}`);
      this.creditCardIssuerId = this.creditCardType.toLowerCase();
      if (this.creditCardIssuerId === CreditCardType.AMEX.toLowerCase()){
            this.creditCardPattern = CreditCardMask.AMEX;
            this.securityCodeLength =  4;
      } else {
            this.creditCardPattern = CreditCardMask.DEFAULT;
            this.securityCodeLength =  3;
      }
    }

    if(this.appCode === 'MERCADOPAGO'){
      this.mercadopagoService.getPaymentMethod({ bin: cardNumber }).subscribe(res => {
        if (!res) {
          this.mercadopagoPaymentMethod = null;
          this.thumbnail = CreditCardImg.DEFAULT;
          return;
        }
        this.disabledForm = false;
        this.mercadopagoPaymentMethod =res[0];
        this.creditCardIssuerId = this.mercadopagoPaymentMethod.id;
        this.creditCardPattern = (this.mercadopagoPaymentMethod.id == 'amex') ? this.PATTERN_AMEX : this.PATTERN_STANDAR;
        this.thumbnail = this.getCreditCardImage(this.mercadopagoPaymentMethod.id);
      });
    }
  }

  getCreditCardImage(creditCardIssuerId: string) {
    try {
      let creditCardImage = CreditCardImg[creditCardIssuerId];
      creditCardImage = (creditCardImage) ? creditCardImage : CreditCardImg[CreditCardImg.DEFAULT];
      return creditCardImage;
    } catch (error) {
      return CreditCardImg[CreditCardImg.DEFAULT];
    }
  }

  onIdentificationTypeChange(identificationType: string) {
    this.disabledDocNumber = false;
    this.currentIdentificationType = this.identificationTypes[this.identificationTypes.findIndex(t => t.name === identificationType.trim())];
  }

  submit() {
    if (!this.formGroup.valid) return;

    const values = this.formGroup.value;

    const mercadopagoTokenRequest: MercadopagoTokenRequest = {
      transaction_amount: this.amount,
      cardNumber: values.cardNumber.trim(),
      cardholderName: values.cardholderName,
      cardExpirationMonth: values.cardExpirationDate ? Number(values.cardExpirationDate.substr(0, 2)) : null,
      cardExpirationYear: values.cardExpirationDate ? Number('20'.toString() + values.cardExpirationDate.substr(3, 2)) : null,
      securityCode: values.securityCode,
      docType: values.docType.trim(),
      docNumber: values.docNumber
    }

    let retryData = {
      transaction_amount: this.amount,
      cardNumber: values.cardNumber,
      cardholderName: values.cardholderName,
      cardExpirationDate: values.cardExpirationDate,
      securityCode: values.securityCode,
      docType: values.docType,
      docNumber: values.docNumber.trim()
    }

    if(this.appCode == 'MERCADOPAGO'){
      const installmentsRequest:MercadopagoInstallmentsRequest ={
        bin: values.cardNumber.replace(/\D/g, ''),
        amount: this.amount
      }

      const fork = forkJoin (
        this.mercadopagoService.createToken(mercadopagoTokenRequest),
        this.mercadopagoService.getInstallments(installmentsRequest)
      )

      fork.subscribe((forkJoinRta) => {
        let card: MercadopagoCard = forkJoinRta[0];
        let installments: MercadopagoInstallmentsResponse = forkJoinRta[1];
        

        card.bankId = installments[0].issuer.id;
        card.bank = installments[0].issuer.name;
        card.type = installments[0].payment_method_id;
        card.payment_type_id = this.mercadopagoPaymentMethod.payment_type_id;

        this.mercadopagoService.clearSession();
        this.viewCtrl.dismiss({card, retryData});
      },
      (error) => {
        this.alertService.show(this.t("credit-card.mercadopago.title"), error);
      });
    }else{
      let card: MercadopagoCard = {
        id: null,
        public_key: null,
        card_id: null,
        luhn_validation: null,
        status: null,
        date_used: null,
        card_number_length: null,
        date_created: null,
        first_six_digits: values.cardNumber.replace(/\D/g, '').substr(0, 6),
        last_four_digits: values.cardNumber.replace(/\D/g, '').substr(values.cardNumber.replace(/\D/g, '').length, -4),
        security_code_length: null,
        expiration_month: mercadopagoTokenRequest.cardExpirationMonth,
        expiration_year: mercadopagoTokenRequest.cardExpirationYear,
        date_last_updated: null,
        date_due: null,
        live_mode: null,
        cardholder: {
          identification: {
            number: mercadopagoTokenRequest.docNumber,
            type: mercadopagoTokenRequest.docType
          },
          name: mercadopagoTokenRequest.cardholderName
        },
        bank: null,
        bankId: null,
        type: this.creditCardIssuerId,
        payment_type_id: null,
        card_number: values.cardNumber.replace(/\D/g, ''),
        cvv: values.securityCode
      }
      this.viewCtrl.dismiss({card, retryData});
    }
  }

  private t(translationKey: string) {
    return this.translateService.instant(translationKey);
  }

  helpSecurityCode() {
    this.template = this.TEMPLATE_HELP_SECURITY_CODE;
  }

  helpExpirationDate() {
    this.template = this.TEMPLATE_HELP_EXPIRATION_DATE;
  }

  closeHelp() {
    this.template = this.TEMPLATE_PAYMENT;
  }

  dismiss() {
    (this.template != this.TEMPLATE_PAYMENT) ? this.closeHelp() : this.viewCtrl.dismiss();
  }

  private getCardIcon(cardNumber: string): CreditCardImg {
    if (new RegExp(CreditCardRegex.VISA).test(cardNumber)) {
      return CreditCardImg.VISA;
    }
    else if (new RegExp(CreditCardRegex.MASTER).test(cardNumber)) {
      return CreditCardImg.MASTER;
    }
    else if (new RegExp(CreditCardRegex.AMEX).test(cardNumber)) {
      return CreditCardImg.AMEX;
    }
    else if (new RegExp(CreditCardRegex.DINERS).test(cardNumber)) {
      return CreditCardImg.DINERS;
    } else {
      return CreditCardImg.DEFAULT;
    }
  }


  private getCardType(cardNumber: string): CreditCardType {
    if (new RegExp(CreditCardRegex.VISA).test(cardNumber)) {
      return CreditCardType.VISA;
    }
    else if (new RegExp(CreditCardRegex.MASTER).test(cardNumber)) {
      return CreditCardType.MASTER;
    }
    else if (new RegExp(CreditCardRegex.AMEX).test(cardNumber)) {
      return CreditCardType.AMEX;
    }
    else if (new RegExp(CreditCardRegex.DINERS).test(cardNumber)) {
      return CreditCardType.DINERS;
    } else {
      return null;
    }
  }

}
