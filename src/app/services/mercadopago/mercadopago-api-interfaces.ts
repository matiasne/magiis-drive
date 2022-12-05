export interface MercadopagoIdentificationTypes {
  id: string,
  name: string,
  type: string,
  min_length: number,
  max_length: number
}

export interface MercadopagoPaymentMethodBin {
  bin: string;
}

export interface MercadopagoPaymentMethodId {
  payment_method_id: string;
}

export interface MercadopagoPaymentMethod {
  id: string,
  name: string,
  payment_type_id: string,
  issuer:{
    name:string,
    id:1
  },
  status: string,
  secure_thumbnail: string,
  thumbnail: string,
  settings: Settings[]
}

export interface Settings {
  bin: Bin,
  security_code: SecurityCode
}

export interface Bin {
  pattern: string,
  exclusion_pattern: string
}

export interface SecurityCode {
  mode: string,
  length: number,
  card_location: string
}


export interface MercadopagoTokenRequest {
  description?: string;
  transaction_amount?: number;
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: number;
  cardExpirationYear: number;
  securityCode: string;
  installments?: number;
  docType: string;
  docNumber: string;
  email?: string;
}

export interface MercadopagoInstallmentsRequest {
  bin: string;
  amount: number;
}

export interface MercadopagoInstallmentsResponse {
  payment_method_id: string;
  payment_type_id: string;
  issuer: {
    id: number;
    name: string;
    secure_thumbnail: string;
    thumbnail: string;
  };
  processing_mode: string;
  merchant_account_id?: any;
  payer_costs: Array<
    {
      installments: number;
      installment_rate: number;
      discount_rate: number;
      reimbursement_rate?: any;
      labels: string[];
      installment_rate_collector: string[];
      min_allowed_amount: number;
      max_allowed_amount: number;
      recommended_message: string;
      installment_amount: number;
      total_amount: number;
      payment_method_option_id: string;
    }>
  agreements?: any;
}

export interface MercadopagoCard {
  id: string;
  public_key: string;
  card_id: number;
  luhn_validation: boolean;
  status: string;
  date_used: string;
  card_number_length: number;
  date_created: Date;
  first_six_digits: string;
  last_four_digits: string;
  security_code_length: number;
  expiration_month: number;
  expiration_year: number;
  date_last_updated: Date;
  date_due: Date;
  live_mode: boolean;
  cardholder: {
    identification: {
      number: string;
      type: string;
    };
    name: string;
  };
  bank:string;
  bankId: number;
  type: string;
  payment_type_id: string,
  card_number,
  cvv
}

