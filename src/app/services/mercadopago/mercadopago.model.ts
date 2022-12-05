import {MercadopagoIdentificationTypes, MercadopagoPaymentMethod} from './mercadopago-api-interfaces';

export interface Mercadopago {
    createToken(mercadopagoTokenRequest, callback: (status: number, response: any) => any );
    getIdentificationTypes(callback: (status: number, response: MercadopagoIdentificationTypes[]) => any );
    getInstallments(mercadopagoInstallmentsRequest, callback: (status: number, response: any) => any );
    setPublishableKey(key:string);
    getPaymentMethods();
    validateLuhn(value:string);
    getPaymentMethod (any, callback: (status: number, response: MercadopagoPaymentMethod[]) => any );
    clearSession();
}
